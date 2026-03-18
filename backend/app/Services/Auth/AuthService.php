<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\Vendeur;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthService
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
     * Inscription d'un nouvel utilisateur
     */
    public function register(array $data)
    {
        // Valider les données (DRY)
        $validated = $this->validationService->validateRegistrationData($data);

        // Créer l'utilisateur
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'country' => $validated['country'],
            'statut' => 'actif',
            'email_verified_at' => now(), // Auto-vérification pour le développement
        ]);

        // Si c'est un vendeur, créer la boutique
        if ($validated['role'] === 'vendeur') {
            Vendeur::create([
                'user_id' => $user->id,
                'shop_name' => $validated['shop_name'],
                'description' => $validated['shop_description'] ?? null,
                'verified' => false, // À vérifier par l'admin
                'rating' => 0,
                'total_sales' => 0,
            ]);
        }

        // Générer le token d'accès avec Passport
        $tokenResult = $user->createToken('Personal Access Token');
        $token = $tokenResult->accessToken;

        return [
            'user' => $user->load('vendeur'),
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_at' => $tokenResult->token->expires_at,
        ];
    }

    /**
     * Connexion d'un utilisateur
     */
    public function login(array $credentials)
    {
        // Valider les credentials (DRY)
        $validated = $this->validationService->validateLoginCredentials($credentials);

        // Vérifier si l'utilisateur existe
        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'email' => ['Cet email n\'existe pas dans notre système.'],
            ]);
        }

        // Vérifier le mot de passe
        if (!Auth::attempt($validated)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'password' => ['Le mot de passe est incorrect.'],
            ]);
        }

        $user = Auth::user();

        // Vérifier les statuts du compte (DRY)
        $this->validationService->validateUserLoginStatus($user);

        // Mettre à jour last_login_at
        // $user->update(['last_login_at' => now()]); // À décommenter une fois la migration appliquée

        // Générer le token d'accès avec Passport
        $tokenResult = $user->createToken('Personal Access Token');
        $token = $tokenResult->accessToken;

        return [
            'user' => $user->load('vendeur'),
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_at' => $tokenResult->token->expires_at,
        ];
    }

  

    /**
     * Déconnexion d'un utilisateur
     */
    public function logout(User $user)
    {
        // Révoquer le token actuel
        $user->token()->revoke();

        return [
            'message' => 'Déconnexion réussie',
        ];
    }

   

    /**
     * Récupérer l'utilisateur authentifié
     */
    public function me(User $user)
    {
        return $user->load('vendeur');
    }

    /**
     * Rafraîchir le token (DRY - utilise TokenService)
     */
    public function refresh(string $refreshToken)
    {
        return $this->tokenService->refreshGrant($refreshToken);
    }


}
