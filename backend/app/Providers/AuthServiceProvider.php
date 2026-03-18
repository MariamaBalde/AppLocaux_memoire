<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Laravel\Passport\Passport;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
                $this->registerPolicies();

        // ✅ Enregistrer les routes Passport
        // Passport::routes(); // Déprécié en Laravel 11
        
        // ✅ Configurer la durée de vie des tokens (optionnel)
        Passport::tokensExpireIn(now()->addDays(15));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));
        
        // // ✅ Définir les scopes (permissions) si nécessaire
        // Passport::tokensCan([
        //     'manage-products' => 'Gérer les produits',
        //     'place-orders' => 'Passer des commandes',
        //     'manage-orders' => 'Gérer les commandes',
        // ]);
        
        // // Scope par défaut
        // Passport::setDefaultScope([
        //     'place-orders',
        // ]);
    }
}