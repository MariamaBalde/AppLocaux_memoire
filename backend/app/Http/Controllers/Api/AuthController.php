<?php

namespace App\Http\Controllers\Api;

use App\Services\Auth\AuthService as AuthAuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller as RoutingController;

class AuthController extends RoutingController
{
    protected $authService;

    public function __construct(AuthAuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Inscription
     * POST /api/auth/register
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $result = $this->authService->register($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Inscription réussie',
                'data' => $result
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'inscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Connexion (méthode simple avec Personal Access Token)
     * POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $result = $this->authService->login($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Connexion réussie',
                'data' => $result
            ], 200);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de connexion',
                'errors' => $e->errors()
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la connexion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Connexion avec OAuth2 Password Grant
     * POST /api/auth/login-oauth
     */
    public function loginOAuth(Request $request): JsonResponse
    {
        try {
            $result = $this->authService->loginWithPasswordGrant($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Connexion OAuth réussie',
                'data' => $result
            ], 200);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de connexion OAuth',
                'errors' => $e->errors()
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la connexion OAuth',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Déconnexion
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $result = $this->authService->logout($request->user());
            
            return response()->json([
                'success' => true,
                'message' => $result['message']
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la déconnexion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

  

    /**
     * Utilisateur connecté
     * GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = $this->authService->me($request->user());
            
            return response()->json([
                'success' => true,
                'data' => $user
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rafraîchir le token
     * POST /api/auth/refresh
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'refresh_token' => 'required|string',
            ]);

            $result = $this->authService->refresh($request->refresh_token);
            
            return response()->json([
                'success' => true,
                'message' => 'Token rafraîchi',
                'data' => $result
            ], 200);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token invalide',
                'errors' => $e->errors()
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du rafraîchissement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}