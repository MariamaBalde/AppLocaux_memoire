<?php

namespace App\Services\Auth;

use Illuminate\Validation\ValidationException;
use GuzzleHttp\Client;

/**
 * Service pour gérer les tokens OAuth (DRY - évite la duplication)
 */
class TokenService
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client();
    }

    /**
     * Requête générique au serveur OAuth
     */
    public function requestToken(array $params)
    {
        try {
            $response = $this->client->post(config('app.url') . '/oauth/token', [
                'form_params' => array_merge($params, [
                    'client_id' => config('passport.password_grant_client.id'),
                    'client_secret' => config('passport.password_grant_client.secret'),
                ]),
            ]);

            return json_decode((string) $response->getBody(), true);
        } catch (\GuzzleHttp\Exception\BadResponseException $e) {
            throw ValidationException::withMessages([
                'token' => ['Erreur lors de la gestion du token.'],
            ]);
        }
    }

    /**
     * Demander un token avec grant_type=password
     */
    public function passwordGrant(string $email, string $password)
    {
        return $this->requestToken([
            'grant_type' => 'password',
            'username' => $email,
            'password' => $password,
            'scope' => '',
        ]);
    }

    /**
     * Rafraîchir un token
     */
    public function refreshGrant(string $refreshToken)
    {
        return $this->requestToken([
            'grant_type' => 'refresh_token',
            'refresh_token' => $refreshToken,
            'scope' => '',
        ]);
    }
}
