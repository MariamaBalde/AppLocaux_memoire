<?php

namespace App\Services\Category;

use App\Models\Category;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class CategoryService
{
    /**
     * Liste toutes les catégories
     */
    public function getAllCategories()
    {
        return Category::withCount('products')
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Récupère une catégorie par son ID
     */
    public function getCategoryById(int $id)
    {
        $category = Category::withCount('products')->find($id);

        if (!$category) {
            throw ValidationException::withMessages([
                'category' => ['Catégorie non trouvée.'],
            ]);
        }

        return $category;
    }

    /**
     * Récupère une catégorie par son slug
     */
    public function getCategoryBySlug(string $slug)
    {
        $category = Category::where('slug', $slug)
            ->withCount('products')
            ->first();

        if (!$category) {
            throw ValidationException::withMessages([
                'category' => ['Catégorie non trouvée.'],
            ]);
        }

        return $category;
    }

    /**
     * Crée une nouvelle catégorie (Admin uniquement)
     */
    public function createCategory(array $data, User $user)
    {
        // Vérifier que l'utilisateur est admin
        if (!$user->isAdmin()) {
            throw ValidationException::withMessages([
                'permission' => ['Seuls les administrateurs peuvent créer des catégories.'],
            ]);
        }

        // Valider les données
        $validated = validator($data, [
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:10', // Emoji ou nom icône
        ])->validate();

        // Créer la catégorie
        $category = Category::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? null,
        ]);

        return $category;
    }

    /**
     * Met à jour une catégorie (Admin uniquement)
     */
    public function updateCategory(int $id, array $data, User $user)
    {
        // Vérifier que l'utilisateur est admin
        if (!$user->isAdmin()) {
            throw ValidationException::withMessages([
                'permission' => ['Seuls les administrateurs peuvent modifier des catégories.'],
            ]);
        }

        $category = Category::find($id);

        if (!$category) {
            throw ValidationException::withMessages([
                'category' => ['Catégorie non trouvée.'],
            ]);
        }

        // Valider les données
        $validated = validator($data, [
            'name' => 'sometimes|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:10',
        ])->validate();

        // Si le nom change, mettre à jour le slug
        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Mettre à jour
        $category->update($validated);

        return $category->load('products');
    }

    /**
     * Supprime une catégorie (Admin uniquement)
     */
    public function deleteCategory(int $id, User $user)
    {
        // Vérifier que l'utilisateur est admin
        if (!$user->isAdmin()) {
            throw ValidationException::withMessages([
                'permission' => ['Seuls les administrateurs peuvent supprimer des catégories.'],
            ]);
        }

        $category = Category::find($id);

        if (!$category) {
            throw ValidationException::withMessages([
                'category' => ['Catégorie non trouvée.'],
            ]);
        }

        // Vérifier si la catégorie a des produits
        if ($category->products()->count() > 0) {
            throw ValidationException::withMessages([
                'category' => ['Impossible de supprimer une catégorie contenant des produits.'],
            ]);
        }

        $category->delete();

        return [
            'message' => 'Catégorie supprimée avec succès',
        ];
    }

    /**
     * Récupère les produits d'une catégorie
     */
    public function getCategoryProducts(int $id, array $filters = [])
    {
        $category = Category::find($id);

        if (!$category) {
            throw ValidationException::withMessages([
                'category' => ['Catégorie non trouvée.'],
            ]);
        }

        $query = $category->products()
            ->with(['vendeur.user', 'category'])
            ->where('is_active', true);

        // Tri
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $filters['per_page'] ?? 12;

        return $query->paginate($perPage);
    }
}