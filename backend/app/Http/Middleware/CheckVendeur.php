<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckVendeur
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
         if (!$request->user() || !$request->user()->isVendeur()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès refusé. Réservé aux vendeurs.'
            ], 403);
        }

        // Vérifier que le vendeur est vérifié (optionnel)
        if (!$request->user()->vendeur->verified) {
            return response()->json([
                'success' => false,
                'message' => 'Votre compte vendeur doit être vérifié par un administrateur.'
            ], 403);
        }
        return $next($request);
    }
}
