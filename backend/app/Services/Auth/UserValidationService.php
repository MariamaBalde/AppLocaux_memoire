<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Validation\ValidationException;

/**
 * Service pour les vérifications d'utilisateur (DRY)
 */
class UserValidationService
{
    /**
     * Vérifier si l'utilisateur peut se connecter
     */
    public function validateUserLoginStatus(User $user): void
    {
        if (is_null($user->email_verified_at)) {
            throw ValidationException::withMessages([
                'email' => ['Veuillez vérifier votre adresse email avant de vous connecter.'],
            ]);
        }

        if ($user->statut !== 'actif') {
            throw ValidationException::withMessages([
                'email' => ['Votre compte a été ' . $user->statut . '. Contactez l\'administrateur.'],
            ]);
        }
    }

    /**
     * Valider les données d'entrée d'enregistrement
     */
    public function validateRegistrationData(array $data): array
    {
        return validator($data, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:client,vendeur',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'country' => 'required|string|max:2',
            'shop_name' => 'required_if:role,vendeur|string|max:255',
            'shop_description' => 'nullable|string',
        ])->validate();
    }

    /**
     * Valider les credentials de login
     */
    public function validateLoginCredentials(array $credentials): array
    {
        return validator($credentials, [
            'email' => 'required|email',
            'password' => 'required|string',
        ])->validate();
    }
}
