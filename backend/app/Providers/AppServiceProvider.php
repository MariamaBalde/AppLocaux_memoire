<?php

namespace App\Providers;

use App\Models\Vendeur;
use App\Observers\VendeurObserver;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(\App\Services\Auth\AuthServiceInterface::class,
            \App\Services\Auth\AuthService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Enregistrer les observers
        Vendeur::observe(VendeurObserver::class);

        ResetPassword::createUrlUsing(function ($user, string $token): string {
            $frontend = rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/');
            return $frontend . '/reset-password?token=' . urlencode($token) . '&email=' . urlencode($user->email);
        });
    }
}
