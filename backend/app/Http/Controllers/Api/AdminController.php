<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Services\AdminService;
use App\Services\Product\ProductService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    protected $adminService;
    protected $productService;

    public function __construct(AdminService $adminService, ProductService $productService)
    {
        $this->adminService = $adminService;
        $this->productService = $productService;
    }

    /**
     * Statistiques du dashboard
     * GET /api/admin/dashboard/stats
     */
    public function dashboardStats(): JsonResponse
    {
        try {
            $stats = $this->adminService->getDashboardStats();

            return response()->json([
                'success' => true,
                'data' => $stats
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistiques avancées
     * GET /api/admin/dashboard/advanced-stats
     */
    public function advancedStats(): JsonResponse
    {
        try {
            $stats = $this->adminService->getAdvancedStats();

            return response()->json([
                'success' => true,
                'data' => $stats
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ventes par mois
     * GET /api/admin/charts/sales-per-month
     */
    public function salesPerMonth(Request $request): JsonResponse
    {
        try {
            $year = $request->year ?? now()->year;
            $data = $this->adminService->getSalesPerMonth($year);

            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Produits par catégorie
     * GET /api/admin/charts/products-by-category
     */
    public function productsByCategory(): JsonResponse
    {
        try {
            $data = $this->adminService->getProductsByCategory();

            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Top vendeurs
     * GET /api/admin/top-vendors
     */
    public function topVendors(Request $request): JsonResponse
    {
        try {
            $limit = $request->limit ?? 10;
            $data = $this->adminService->getTopVendors($limit);

            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dernières commandes
     * GET /api/admin/recent-orders
     */
    public function recentOrders(Request $request): JsonResponse
    {
        try {
            $limit = $request->limit ?? 10;
            $data = $this->adminService->getRecentOrders($limit);

            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Derniers utilisateurs
     * GET /api/admin/recent-users
     */
    public function recentUsers(Request $request): JsonResponse
    {
        try {
            $limit = $request->limit ?? 10;
            $data = $this->adminService->getRecentUsers($limit);

            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vendeurs en attente
     * GET /api/admin/pending-vendors
     */
    public function pendingVendors(): JsonResponse
    {
        try {
            $data = $this->adminService->getPendingVendors();

            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approuver un vendeur
     * POST /api/admin/vendors/{id}/approve
     */
    public function approveVendor(Request $request, int $id): JsonResponse
    {
        try {
            $result = $this->adminService->approveVendor($id, $request->user());

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result['vendeur']
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rejeter un vendeur
     * POST /api/admin/vendors/{id}/reject
     */
    public function rejectVendor(Request $request, int $id): JsonResponse
    {
        try {
            $reason = $request->input('reason');
            $result = $this->adminService->rejectVendor($id, $request->user(), $reason);

            return response()->json([
                'success' => true,
                'message' => $result['message']
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Suspendre/Activer un utilisateur
     * POST /api/admin/users/{id}/toggle-status
     */
    public function toggleUserStatus(Request $request, int $id): JsonResponse
    {
        try {
            $result = $this->adminService->toggleUserStatus($id, $request->user());

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result['user']
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Liste des utilisateurs
     * GET /api/admin/users
     */
    public function users(Request $request): JsonResponse
    {
        try {
            $filters = $request->all();
            $users = $this->adminService->getAllUsers($filters);

            return response()->json([
                'success' => true,
                'data' => $users
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un produit pour le compte d'un vendeur
     * POST /api/admin/products
     */
    public function createProductForVendor(Request $request): JsonResponse
    {
        try {
            $product = $this->productService->createProductForVendor(
                $request->all(),
                $request->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'Produit créé pour le vendeur avec succès',
                'data' => new ProductResource($product),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du produit vendeur',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
