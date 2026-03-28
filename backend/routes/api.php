<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes - Authentification avec Passport
|--------------------------------------------------------------------------
*/

// Routes publiques (sans authentification)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh']); // Rafraîchir token
});

// Routes protégées (avec authentification Passport)
Route::middleware('auth:api')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

/*
|--------------------------------------------------------------------------
| API Routes - Produits
|--------------------------------------------------------------------------
*/

// Routes publiques - Consultation des produits
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/new', [ProductController::class, 'newest']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Vendeur uniquement
Route::middleware(['auth:api', 'vendeur'])->group(function () {
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/vendor/products', [ProductController::class, 'myProducts']);
});

// Vendeur OU Admin
Route::middleware(['auth:api', 'role:vendeur,admin'])->group(function () {
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::patch('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::patch('/products/{id}/toggle', [ProductController::class, 'toggle']);
    Route::patch('/products/{id}/stock', [ProductController::class, 'updateStock']);
});

/*
|--------------------------------------------------------------------------
| API Routes - Catégories
|--------------------------------------------------------------------------
*/

// Routes publiques - Consultation des catégories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/categories/slug/{slug}', [CategoryController::class, 'showBySlug']);
Route::get('/categories/{id}/products', [CategoryController::class, 'products']);

// Routes protégées - Gestion des catégories (Admin uniquement)
Route::middleware(['auth:api', 'admin'])->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::patch('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| API Routes - Panier (Cart)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:api')->prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'index']);           // Récupérer le panier
    Route::post('/', [CartController::class, 'store']);          // Ajouter au panier
    Route::patch('/{id}', [CartController::class, 'update']);    // Mettre à jour quantité
    Route::put('/{id}', [CartController::class, 'update']);
    Route::delete('/{id}', [CartController::class, 'destroy']);  // Supprimer du panier
    Route::delete('/', [CartController::class, 'clear']);        // Vider le panier
    Route::get('/check', [CartController::class, 'check']);      // Vérifier disponibilité
});

/*
|--------------------------------------------------------------------------
| API Routes - Commandes (Orders)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:api')->prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index']);                    // Lister les commandes
    Route::post('/', [OrderController::class, 'store']);                   // Créer une commande
    Route::get('/{id}', [OrderController::class, 'show']);                 // Détail d'une commande
    Route::patch('/{id}/cancel', [OrderController::class, 'cancel']);      // Annuler une commande
    Route::post('/{id}/confirm-payment', [OrderController::class, 'confirmPayment']); // Confirmer paiement
});