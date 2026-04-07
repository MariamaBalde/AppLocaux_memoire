<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Vendeur;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminService
{
    /**
     * ═══════════════════════════════════════════════════════
     * STATISTIQUES GÉNÉRALES (DASHBOARD)
     * ═══════════════════════════════════════════════════════
     */
    public function getDashboardStats()
    {
        // Statistiques globales
        $stats = [
            'total_users' => User::count(),
            'total_clients' => User::where('role', 'client')->count(),
            'total_vendeurs' => User::where('role', 'vendeur')->count(),
            'total_admins' => User::where('role', 'admin')->count(),
            
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'out_of_stock' => Product::where('stock', 0)->count(),
            
            'total_categories' => Category::count(),
            
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'processing_orders' => Order::where('status', 'processing')->count(),
            'completed_orders' => Order::where('status', 'delivered')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
            
            'total_revenue' => Order::whereIn('status', ['processing', 'shipped', 'delivered'])
                ->sum('total'),
            'revenue_this_month' => Order::whereIn('status', ['processing', 'shipped', 'delivered'])
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total'),
            
            'pending_vendeurs' => Vendeur::where('verified', false)->count(),
        ];

        return $stats;
    }

    /**
     * ═══════════════════════════════════════════════════════
     * VENTES PAR MOIS (pour graphique)
     * ═══════════════════════════════════════════════════════
     */
    public function getSalesPerMonth(int $year = null)
    {
        $year = $year ?? now()->year;

        $sales = Order::selectRaw('MONTH(created_at) as month, SUM(total) as total, COUNT(*) as count')
            ->whereYear('created_at', $year)
            ->whereIn('status', ['processing', 'shipped', 'delivered'])
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Remplir les mois manquants avec 0
        $monthlySales = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthData = $sales->firstWhere('month', $i);
            $monthlySales[] = [
                'month' => $i,
                'month_name' => date('F', mktime(0, 0, 0, $i, 1)),
                'total' => $monthData ? (float) $monthData->total : 0,
                'orders_count' => $monthData ? $monthData->count : 0,
            ];
        }

        return $monthlySales;
    }

    /**
     * ═══════════════════════════════════════════════════════
     * PRODUITS PAR CATÉGORIE (pour graphique)
     * ═══════════════════════════════════════════════════════
     */
    public function getProductsByCategory()
    {
        return Category::withCount('products')
            ->orderBy('products_count', 'desc')
            ->get()
            ->map(function ($category) {
                return [
                    'category' => $category->name,
                    'count' => $category->products_count,
                ];
            });
    }

    /**
     * ═══════════════════════════════════════════════════════
     * TOP VENDEURS
     * ═══════════════════════════════════════════════════════
     */
    public function getTopVendors(int $limit = 10)
    {
        return Vendeur::with('user')
            ->orderBy('total_sales', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($vendeur) {
                return [
                    'id' => $vendeur->id,
                    'shop_name' => $vendeur->shop_name,
                    'user_name' => $vendeur->user->name,
                    'total_sales' => $vendeur->total_sales,
                    'rating' => $vendeur->rating,
                    'verified' => $vendeur->verified,
                ];
            });
    }

    /**
     * ═══════════════════════════════════════════════════════
     * DERNIÈRES COMMANDES
     * ═══════════════════════════════════════════════════════
     */
    public function getRecentOrders(int $limit = 10)
    {
        return Order::with(['user', 'payment'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * ═══════════════════════════════════════════════════════
     * DERNIERS UTILISATEURS INSCRITS
     * ═══════════════════════════════════════════════════════
     */
    public function getRecentUsers(int $limit = 10)
    {
        return User::with('vendeur')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * ═══════════════════════════════════════════════════════
     * VENDEURS EN ATTENTE DE VÉRIFICATION
     * ═══════════════════════════════════════════════════════
     */
    public function getPendingVendors()
    {
        return Vendeur::with('user')
            ->where('verified', false)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * ═══════════════════════════════════════════════════════
     * APPROUVER UN VENDEUR
     * ═══════════════════════════════════════════════════════
     */
    public function approveVendor(int $vendeurId, User $admin)
    {
        if (!$admin->isAdmin()) {
            throw ValidationException::withMessages([
                'permission' => ['Seuls les administrateurs peuvent approuver des vendeurs.'],
            ]);
        }

        $vendeur = Vendeur::with('user')->find($vendeurId);

        if (!$vendeur) {
            throw ValidationException::withMessages([
                'vendeur' => ['Vendeur non trouvé.'],
            ]);
        }

        if ($vendeur->verified) {
            throw ValidationException::withMessages([
                'vendeur' => ['Ce vendeur est déjà vérifié.'],
            ]);
        }

        $vendeur->update(['verified' => true]);

        // TODO: Envoyer email de confirmation au vendeur
        // Mail::to($vendeur->user->email)->send(new VendorApproved($vendeur));

        return [
            'message' => 'Vendeur approuvé avec succès',
            'vendeur' => $vendeur,
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════
     * REJETER UN VENDEUR
     * ═══════════════════════════════════════════════════════
     */
    public function rejectVendor(int $vendeurId, User $admin, string $reason = null)
    {
        if (!$admin->isAdmin()) {
            throw ValidationException::withMessages([
                'permission' => ['Seuls les administrateurs peuvent rejeter des vendeurs.'],
            ]);
        }

        $vendeur = Vendeur::with('user')->find($vendeurId);

        if (!$vendeur) {
            throw ValidationException::withMessages([
                'vendeur' => ['Vendeur non trouvé.'],
            ]);
        }

        // TODO: Envoyer email de rejet au vendeur avec raison
        // Mail::to($vendeur->user->email)->send(new VendorRejected($vendeur, $reason));

        // Supprimer le vendeur et l'utilisateur
        $vendeur->user->delete(); // Cascade delete sur vendeur

        return [
            'message' => 'Vendeur rejeté et supprimé',
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════
     * SUSPENDRE/ACTIVER UN UTILISATEUR
     * ═══════════════════════════════════════════════════════
     */
    public function toggleUserStatus(int $userId, User $admin)
    {
        if (!$admin->isAdmin()) {
            throw ValidationException::withMessages([
                'permission' => ['Seuls les administrateurs peuvent modifier le statut des utilisateurs.'],
            ]);
        }

        $user = User::find($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['Utilisateur non trouvé.'],
            ]);
        }

        // Ne peut pas suspendre un autre admin
        if ($user->isAdmin() && $user->id !== $admin->id) {
            throw ValidationException::withMessages([
                'user' => ['Impossible de modifier le statut d\'un autre administrateur.'],
            ]);
        }

        // Toggle entre actif et suspendu
        $newStatus = $user->statut === 'actif' ? 'suspendu' : 'actif';
        $user->update(['statut' => $newStatus]);

        return [
            'message' => 'Statut utilisateur modifié',
            'user' => $user,
            'new_status' => $newStatus,
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════
     * STATISTIQUES AVANCÉES
     * ═══════════════════════════════════════════════════════
     */
    public function getAdvancedStats()
    {
        return [
            // Taux de conversion
            'conversion_rate' => $this->calculateConversionRate(),
            
            // Panier moyen
            'average_order_value' => Order::whereIn('status', ['processing', 'shipped', 'delivered'])
                ->avg('total'),
            
            // Produit le plus vendu
            'top_product' => $this->getTopProduct(),
            
            // Catégorie la plus vendue
            'top_category' => $this->getTopCategory(),
            
            // Évolution du CA (comparaison mois actuel vs mois précédent)
            'revenue_growth' => $this->calculateRevenueGrowth(),
        ];
    }

    protected function calculateConversionRate()
    {
        $totalUsers = User::where('role', 'client')->count();
        $usersWithOrders = User::where('role', 'client')
            ->whereHas('orders')
            ->count();

        return $totalUsers > 0 ? round(($usersWithOrders / $totalUsers) * 100, 2) : 0;
    }

    protected function getTopProduct()
    {
        $topProductId = DB::table('order_items')
            ->select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->groupBy('product_id')
            ->orderBy('total_sold', 'desc')
            ->first();

        if ($topProductId) {
            return Product::find($topProductId->product_id);
        }

        return null;
    }

    protected function getTopCategory()
    {
        $topCategoryId = DB::table('products')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->select('products.category_id', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->groupBy('products.category_id')
            ->orderBy('total_sold', 'desc')
            ->first();

        if ($topCategoryId) {
            return Category::find($topCategoryId->category_id);
        }

        return null;
    }

    protected function calculateRevenueGrowth()
    {
        $currentMonth = Order::whereIn('status', ['processing', 'shipped', 'delivered'])
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total');

        $lastMonth = Order::whereIn('status', ['processing', 'shipped', 'delivered'])
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total');

        if ($lastMonth > 0) {
            $growth = (($currentMonth - $lastMonth) / $lastMonth) * 100;
            return round($growth, 2);
        }

        return 0;
    }

    /**
     * ═══════════════════════════════════════════════════════
     * LISTE DE TOUS LES UTILISATEURS (avec filtres)
     * ═══════════════════════════════════════════════════════
     */
    public function getAllUsers(array $filters = [])
    {
        $query = User::with('vendeur');

        // Filtre par rôle
        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        // Filtre par statut
        if (isset($filters['statut'])) {
            $query->where('statut', $filters['statut']);
        }

        // Recherche
        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('email', 'like', '%' . $filters['search'] . '%');
            });
        }

        // Tri
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $filters['per_page'] ?? 20;

        return $query->paginate($perPage);
    }
}
