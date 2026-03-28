<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Category\CategoryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    protected $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    /**
     * Liste toutes les catégories (public)
     * GET /api/categories
     */
    public function index(): JsonResponse
    {
        try {
            $categories = $this->categoryService->getAllCategories();

            return response()->json([
                'success' => true,
                'data' => $categories
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des catégories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Affiche une catégorie spécifique (public)
     * GET /api/categories/{id}
     */
    public function show(int $id): JsonResponse
    {
        try {
            $category = $this->categoryService->getCategoryById($id);

            return response()->json([
                'success' => true,
                'data' => $category
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Catégorie non trouvée',
                'errors' => $e->errors()
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la catégorie',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Affiche une catégorie par son slug (public)
     * GET /api/categories/slug/{slug}
     */
    public function showBySlug(string $slug): JsonResponse
    {
        try {
            $category = $this->categoryService->getCategoryBySlug($slug);

            return response()->json([
                'success' => true,
                'data' => $category
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Catégorie non trouvée',
                'errors' => $e->errors()
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la catégorie',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crée une nouvelle catégorie (admin uniquement)
     * POST /api/categories
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $category = $this->categoryService->createCategory(
                $request->all(),
                $request->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'Catégorie créée avec succès',
                'data' => $category
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
                'message' => 'Erreur lors de la création de la catégorie',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Met à jour une catégorie (admin uniquement)
     * PUT/PATCH /api/categories/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $category = $this->categoryService->updateCategory(
                $id,
                $request->all(),
                $request->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'Catégorie mise à jour avec succès',
                'data' => $category
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la catégorie',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime une catégorie (admin uniquement)
     * DELETE /api/categories/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $result = $this->categoryService->deleteCategory(
                $id,
                $request->user()
            );

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
                'message' => 'Erreur lors de la suppression de la catégorie',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les produits d'une catégorie (public)
     * GET /api/categories/{id}/products
     */
    public function products(Request $request, int $id): JsonResponse
    {
        try {
            $filters = $request->all();
            $products = $this->categoryService->getCategoryProducts($id, $filters);

            return response()->json([
                'success' => true,
                'data' => $products
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Catégorie non trouvée',
                'errors' => $e->errors()
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des produits',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}