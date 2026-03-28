<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\Vendeur;
use App\Services\Auth\AuthServiceInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthService implements AuthServiceInterface
{
    private UserValidationService $validationService;
    private TokenService $tokenService;

    public function __construct(
        UserValidationService $validationService,
        TokenService $tokenService
    ) {
        $this->validationService = $validationService;
        $this->tokenService = $tokenService;
    }

    /**
     * Inscription d'un nouvel utilisateur avec transaction
     */
    public function register(array $data): array
    {
        $validated = $this->validationService->validateRegistrationData($data);

        // Utiliser une transaction pour garantir l'atomicité
        return DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'country' => $validated['country'],
                'statut' => 'actif',
                'email_verified_at' => now(),
            ]);

            if ($validated['role'] === 'vendeur') {
                Vendeur::create([
                    'user_id' => $user->id,
                    'shop_name' => $validated['shop_name'],
                    'description' => $validated['shop_description'] ?? null,
                    'verified' => false,
                    'rating' => 0,
                    'total_sales' => 0,
                ]);
            }

            $tokenResult = $user->createToken('Personal Access Token');

            return $this->formatAuthResponse($user, $tokenResult);
        });
    }

    /**
     * Connexion d'un utilisateur
     */
    public function login(array $credentials): array
    {
        $validated = $this->validationService->validateLoginCredentials($credentials);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Cet email n\'existe pas dans notre système.'],
            ]);
        }

        if (!Auth::attempt($validated)) {
            throw ValidationException::withMessages([
                'password' => ['Le mot de passe est incorrect.'],
            ]);
        }

        $user = Auth::user();
        $this->validationService->validateUserLoginStatus($user);

        $tokenResult = $user->createToken('Personal Access Token');

        return $this->formatAuthResponse($user, $tokenResult);
    }

    /**
     * Déconnexion d'un utilisateur
     */
    public function logout(User $user): array
    {
        $user->token()?->revoke();

        return ['message' => 'Déconnexion réussie'];
    }

    /**
     * Récupérer l'utilisateur authentifié
     */
    public function me(User $user): User
    {
        return $user->load('vendeur');
    }

    /**
     * Rafraîchir le token
     */
    public function refresh(string $refreshToken): array
    {
        return $this->tokenService->refreshGrant($refreshToken);
    }

    /**
     * Format la réponse d'authentification (DRY)
     */
    private function formatAuthResponse(User $user, $tokenResult): array
    {
        return [
            'user' => $user->load('vendeur'),
            'access_token' => $tokenResult->accessToken,
            'token_type' => 'Bearer',
            'expires_at' => $tokenResult->token->expires_at,
        ];
    }
}
