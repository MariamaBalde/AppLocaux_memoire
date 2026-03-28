<?php

namespace App\Services\Product;

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductService
{
    
    public function getAllProducts(array $filters = [])
    {
        $query = Product::with(['vendeur.user', 'category'])
            ->where('is_active', true);

        // Filtre par catégorie
        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Filtre par vendeur
        if (isset($filters['vendeur_id'])) {
            $query->where('vendeur_id', $filters['vendeur_id']);
        }

        // Filtre par prix minimum
        if (isset($filters['price_min'])) {
            $query->where('price', '>=', $filters['price_min']);
        }

        // Filtre par prix maximum
        if (isset($filters['price_max'])) {
            $query->where('price', '<=', $filters['price_max']);
        }

        // Filtre par stock disponible uniquement
        if (isset($filters['in_stock']) && $filters['in_stock'] == true) {
            $query->where('stock', '>', 0);
        }

        // Recherche avancée (nom + description)
        if (isset($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                  ->orWhere('description', 'like', $searchTerm);
            });
        }

        // Filtre par poids (livraison)
        if (isset($filters['weight_max'])) {
            $query->where('weight', '<=', $filters['weight_max']);
        }

        // Filtre par date de création
        if (isset($filters['created_after'])) {
            $query->where('created_at', '>=', $filters['created_after']);
        }

        if (isset($filters['created_before'])) {
            $query->where('created_at', '<=', $filters['created_before']);
        }

        // Tri
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        // Valider les colonnes de tri
        $validSortColumns = ['created_at', 'price', 'name', 'stock', 'updated_at'];
        if (!in_array($sortBy, $validSortColumns)) {
            $sortBy = 'created_at';
        }

        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = min($filters['per_page'] ?? 12, 100);

        return $query->paginate($perPage);
    }

  
    public function getProductById(int $id)
    {
        $product = Product::with(['vendeur.user', 'category', 'creator'])
            ->find($id);

        if (!$product) {
            throw ValidationException::withMessages([
                'product' => ['Produit non trouvé.'],
            ]);
        }

        return $product;
    }

   
    public function createProduct(array $data, User $user)
    {
        // Vérifier que l'utilisateur est un vendeur
        if (!$user->isVendeur()) {
            throw ValidationException::withMessages([
                'role' => ['Seuls les vendeurs peuvent créer des produits.'],
            ]);
        }

        // Vérifier que le vendeur est vérifié
        if (!$user->vendeur->verified) {
            throw ValidationException::withMessages([
                'verified' => ['Votre compte vendeur doit être vérifié pour ajouter des produits.'],
            ]);
        }

        // Valider les données
        $validated = validator($data, [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048', // 2MB max par image
            'is_active' => 'boolean',
        ])->validate();

        // Uploader les images
        $imageUrls = [];
        if (isset($validated['images'])) {
            foreach ($validated['images'] as $image) {
                $path = $image->store('products', 'public');
                $imageUrls[] = Storage::url($path);
            }
        }

        // Créer le produit
        $product = Product::create([
            'vendeur_id' => $user->vendeur->id,
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'weight' => $validated['weight'] ?? null,
            'images' => $imageUrls,
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => $user->id,
        ]);

        return $product->load(['vendeur.user', 'category']);
    }

    public function updateProduct(int $id, array $data, User $user)
    {
        $product = Product::find($id);

        if (!$product) {
            throw ValidationException::withMessages([
                'product' => ['Produit non trouvé.'],
            ]);
        }

        // Vérifier les permissions
        if (!$user->isAdmin() && $product->vendeur_id !== $user->vendeur?->id) {
            throw ValidationException::withMessages([
                'permission' => ['Vous n\'êtes pas autorisé à modifier ce produit.'],
            ]);
        }

        // Valider les données
        $validated = validator($data, [
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_active' => 'sometimes|boolean',
        ])->validate();

        // Uploader les nouvelles images si présentes
        if (isset($validated['images'])) {
            // Supprimer les anciennes images
            if ($product->images && is_array($product->images)) {
                foreach ($product->images as $oldImage) {
                    if ($oldImage) {
                        $oldPath = str_replace('/storage/', '', $oldImage);
                        Storage::disk('public')->delete($oldPath);
                    }
                }
            }

            // Uploader les nouvelles images
            $imageUrls = [];
            foreach ($validated['images'] as $image) {
                $path = $image->store('products', 'public');
                $imageUrls[] = Storage::url($path);
            }
            $validated['images'] = $imageUrls;
        }

        // Ajouter updated_by
        $validated['updated_by'] = $user->id;

        // Mettre à jour le produit
        $product->update($validated);

        return $product->load(['vendeur.user', 'category']);
    }

   
    public function deleteProduct(int $id, User $user)
    {
        $product = Product::find($id);

        if (!$product) {
            throw ValidationException::withMessages([
                'product' => ['Produit non trouvé.'],
            ]);
        }

        // Vérifier les permissions
        if (!$user->isAdmin() && $product->vendeur_id !== $user->vendeur?->id) {
            throw ValidationException::withMessages([
                'permission' => ['Vous n\'êtes pas autorisé à supprimer ce produit.'],
            ]);
        }

        // Vérifier si le produit est dans des commandes actives
        // TODO: À implémenter quand OrderItem sera créé
        // if ($product->orderItems()->whereHas('order', function($q) {
        //     $q->whereIn('status', ['pending', 'processing', 'shipped']);
        // })->exists()) {
        //     throw ValidationException::withMessages([
        //         'product' => ['Impossible de supprimer un produit avec des commandes actives.'],
        //     ]);
        // }

        // Supprimer les images du storage
        if ($product->images) {
            foreach ($product->images as $image) {
                $path = str_replace('/storage/', '', $image);
                Storage::disk('public')->delete($path);
            }
        }

        // Supprimer le produit
        $product->delete();

        return [
            'message' => 'Produit supprimé avec succès',
        ];
    }

   
    public function toggleProductStatus(int $id, User $user)
    {
        $product = Product::find($id);

        if (!$product) {
            throw ValidationException::withMessages([
                'product' => ['Produit non trouvé.'],
            ]);
        }

        // Vérifier les permissions
        if (!$user->isAdmin() && $product->vendeur_id !== $user->vendeur?->id) {
            throw ValidationException::withMessages([
                'permission' => ['Vous n\'êtes pas autorisé à modifier ce produit.'],
            ]);
        }

        // Inverser le statut
        $product->update([
            'is_active' => !$product->is_active,
            'updated_by' => $user->id,
        ]);

        return $product->load(['vendeur.user', 'category']);
    }

   
    public function getVendorProducts(User $user, array $filters = [])
    {
        if (!$user->isVendeur()) {
            throw ValidationException::withMessages([
                'role' => ['Seuls les vendeurs peuvent accéder à cette ressource.'],
            ]);
        }

        $query = Product::with(['category'])
            ->where('vendeur_id', $user->vendeur->id);

        // Filtre par statut (actif/inactif)
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        // Recherche
        if (isset($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        // Tri
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $filters['per_page'] ?? 10;

        return $query->paginate($perPage);
    }

   
    public function updateStock(int $id, int $quantity, User $user)
    {
        $product = Product::find($id);

        if (!$product) {
            throw ValidationException::withMessages([
                'product' => ['Produit non trouvé.'],
            ]);
        }

        // Vérifier les permissions
        if (!$user->isAdmin() && $product->vendeur_id !== $user->vendeur?->id) {
            throw ValidationException::withMessages([
                'permission' => ['Vous n\'êtes pas autorisé à modifier ce produit.'],
            ]);
        }

        // Valider la quantité
        if ($quantity < 0) {
            throw ValidationException::withMessages([
                'quantity' => ['La quantité ne peut pas être négative.'],
            ]);
        }

        // Mettre à jour le stock
        $product->update([
            'stock' => $quantity,
            'updated_by' => $user->id,
        ]);

        return $product->load(['vendeur.user', 'category']);
    }

    /**
     * ═══════════════════════════════════════════════════════
     * RECHERCHE AVANCÉE DE PRODUITS
     * ═══════════════════════════════════════════════════════
     */
    public function searchProducts(array $filters = [])
    {
        $query = Product::with(['vendeur.user', 'category'])
            ->where('is_active', true);

        // ══════════════════════════════════════════
        // RECHERCHE PAR MOT-CLÉ (nom, description)
        // ══════════════════════════════════════════
        if (isset($filters['q']) && !empty($filters['q'])) {
            $searchTerm = $filters['q'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%');
            });
        }

        // ══════════════════════════════════════════
        // FILTRES
        // ══════════════════════════════════════════
        
        // Catégorie(s) - supporte plusieurs catégories
        if (isset($filters['categories'])) {
            $categories = is_array($filters['categories']) 
                ? $filters['categories'] 
                : explode(',', $filters['categories']);
            $query->whereIn('category_id', $categories);
        }

        // Vendeur
        if (isset($filters['vendeur_id'])) {
            $query->where('vendeur_id', $filters['vendeur_id']);
        }

        // Prix minimum
        if (isset($filters['price_min'])) {
            $query->where('price', '>=', $filters['price_min']);
        }

        // Prix maximum
        if (isset($filters['price_max'])) {
            $query->where('price', '<=', $filters['price_max']);
        }

        // Stock disponible uniquement
        if (isset($filters['in_stock']) && $filters['in_stock'] == 'true') {
            $query->where('stock', '>', 0);
        }

        // Poids minimum
        if (isset($filters['weight_min'])) {
            $query->where('weight', '>=', $filters['weight_min']);
        }

        // Poids maximum
        if (isset($filters['weight_max'])) {
            $query->where('weight', '<=', $filters['weight_max']);
        }

        // ══════════════════════════════════════════
        // TRI
        // ══════════════════════════════════════════
        
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        // Tris personnalisés
        switch ($sortBy) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            default:
                $query->orderBy($sortBy, $sortOrder);
        }

        // ══════════════════════════════════════════
        // PAGINATION
        // ══════════════════════════════════════════
        
        $perPage = $filters['per_page'] ?? 12;
        
        return $query->paginate($perPage);
    }

    /**
     * ═══════════════════════════════════════════════════════
     * NOUVEAUTÉS - Produits récemment ajoutés
     * ═══════════════════════════════════════════════════════
     */
    public function getNewProducts(int $limit = 8)
    {
        return Product::with(['vendeur.user', 'category'])
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}