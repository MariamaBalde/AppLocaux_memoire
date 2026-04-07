<?php

namespace App\Services\Order;

use App\Events\OrderPlaced;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Cart;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    private const VENDOR_ALLOWED_STATUSES = ['processing', 'shipped', 'delivered'];

    private function resolveVendorOrder(User $user, int $id): Order
    {
        if (!$user->isVendeur() || !$user->vendeur) {
            throw ValidationException::withMessages([
                'role' => ['Seuls les vendeurs peuvent accéder à cette ressource.'],
            ]);
        }

        $vendeurId = $user->vendeur->id;

        $order = Order::with([
            'user:id,name,email,phone',
            'payment',
            'items' => function ($query) use ($vendeurId) {
                $query->where('vendeur_id', $vendeurId)
                    ->with('product:id,name,images');
            },
        ])
            ->whereHas('items', function ($query) use ($vendeurId) {
                $query->where('vendeur_id', $vendeurId);
            })
            ->find($id);

        if (!$order) {
            throw ValidationException::withMessages([
                'order' => ['Commande non trouvée pour ce vendeur.'],
            ]);
        }

        return $order;
    }

    /**
     * ═══════════════════════════════════════════════════════
     * CRÉER UNE COMMANDE DEPUIS LE PANIER
     * ═══════════════════════════════════════════════════════
     */
    public function createOrderFromCart(User $user, array $data)
    {
        // Valider les données
        $validated = validator($data, [
            'shipping_address' => 'required|string',
            'shipping_method' => 'required|string|in:standard,express,pickup',
            'payment_method' => 'required|string|in:wave,orange_money,stripe,paypal,visa',
            'notes' => 'nullable|string',
        ])->validate();

        DB::beginTransaction();

        try {
            $cartItems = Cart::with('product')
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => ['Le panier est vide.'],
                ]);
            }

            // Vérifier la disponibilité sur lignes verrouillées
            $lockedProducts = Product::query()
                ->whereIn('id', $cartItems->pluck('product_id')->all())
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($cartItems as $item) {
                $product = $lockedProducts->get($item->product_id);

                if (!$product || !$product->is_active) {
                    throw ValidationException::withMessages([
                        'product' => ['Le produit "' . ($product->name ?? 'inconnu') . '" n\'est plus disponible.'],
                    ]);
                }

                if ($product->stock < $item->quantity) {
                    throw ValidationException::withMessages([
                        'stock' => ['Stock insuffisant pour "' . $product->name . '". Disponible : ' . $product->stock],
                    ]);
                }
            }

            // Calculer les montants à partir des prix verrouillés
            $subtotal = $cartItems->sum(function ($item) use ($lockedProducts) {
                $product = $lockedProducts->get($item->product_id);
                return (float) ($product?->price ?? 0) * $item->quantity;
            });

            $shippingCost = $this->calculateShippingCost($validated['shipping_method'], (float) $subtotal);
            $total = (float) $subtotal + $shippingCost;

            // Générer un numéro de commande robuste en concurrence
            do {
                $orderNumber = 'CMD-' . now()->format('Y') . '-' . strtoupper(Str::random(10));
            } while (Order::where('order_number', $orderNumber)->exists());

            // Créer la commande
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'total' => $total,
                'status' => 'pending',
                'shipping_method' => $validated['shipping_method'],
                'shipping_address' => $validated['shipping_address'],
                'shipping_cost' => $shippingCost,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Créer les items de commande
            foreach ($cartItems as $cartItem) {
                $product = $lockedProducts->get($cartItem->product_id);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'vendeur_id' => $product->vendeur_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $product->price,
                    'subtotal' => $product->price * $cartItem->quantity,
                ]);

                // Décrémenter le stock
                $product->decrement('stock', $cartItem->quantity);
            }

            // Créer le paiement (en attente)
            $payment = Payment::create([
                'order_id' => $order->id,
                'amount' => $total,
                'method' => $validated['payment_method'],
                'status' => 'pending',
            ]);

            // Vider le panier
            Cart::where('user_id', $user->id)->delete();

            DB::commit();

            // Dispatcher l'événement OrderPlaced pour les notifications
            OrderPlaced::dispatch($order->load(['items.product', 'payment', 'user']));

            return [
                'order' => $order->load(['items.product', 'payment']),
                'payment' => $payment,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * ═══════════════════════════════════════════════════════
     * CALCULER LES FRAIS DE LIVRAISON
     * ═══════════════════════════════════════════════════════
     */
    protected function calculateShippingCost(string $method, float $subtotal): float
    {
        // Livraison gratuite si > 50 000 FCFA
        if ($subtotal >= 50000) {
            return 0;
        }

        return match($method) {
            'standard' => 3000,  // 3 000 FCFA
            'express' => 5000,   // 5 000 FCFA
            'pickup' => 0,       // Gratuit
            default => 3000,
        };
    }

    /**
     * ═══════════════════════════════════════════════════════
     * RÉCUPÉRER LES COMMANDES D'UN UTILISATEUR
     * ═══════════════════════════════════════════════════════
     */
    public function getUserOrders(User $user, array $filters = [])
    {
        $query = Order::with(['items.product', 'payment'])
            ->where('user_id', $user->id);

        // Filtre par statut
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Tri
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $validSortColumns = ['created_at', 'updated_at', 'status', 'total', 'order_number'];
        if (!in_array($sortBy, $validSortColumns, true)) {
            $sortBy = 'created_at';
        }
        if (!in_array($sortOrder, ['asc', 'desc'], true)) {
            $sortOrder = 'desc';
        }
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = min(max((int) ($filters['per_page'] ?? 10), 1), 100);

        return $query->paginate($perPage);
    }

    /**
     * ═══════════════════════════════════════════════════════
     * RÉCUPÉRER UNE COMMANDE PAR SON ID
     * ═══════════════════════════════════════════════════════
     */
    public function getOrderById(User $user, int $id)
    {
        $order = Order::with(['items.product.vendeur', 'payment'])
            ->where('user_id', $user->id)
            ->find($id);

        if (!$order) {
            throw ValidationException::withMessages([
                'order' => ['Commande non trouvée.'],
            ]);
        }

        return $order;
    }

    /**
     * ═══════════════════════════════════════════════════════
     * ANNULER UNE COMMANDE
     * ═══════════════════════════════════════════════════════
     */
    public function cancelOrder(User $user, int $id)
    {
        $order = Order::where('user_id', $user->id)->find($id);

        if (!$order) {
            throw ValidationException::withMessages([
                'order' => ['Commande non trouvée.'],
            ]);
        }

        // Vérifier le statut
        if (!in_array($order->status, ['pending', 'processing'])) {
            throw ValidationException::withMessages([
                'order' => ['Cette commande ne peut plus être annulée.'],
            ]);
        }

        DB::beginTransaction();

        try {
            // Remettre le stock
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }

            // Mettre à jour le statut
            $order->update(['status' => 'cancelled']);

            // Mettre à jour le paiement si existant
            if ($order->payment) {
                $order->payment->update(['status' => 'refunded']);
            }

            DB::commit();

            return [
                'message' => 'Commande annulée avec succès',
                'order' => $order->load(['items.product', 'payment']),
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * ═══════════════════════════════════════════════════════
     * CONFIRMER LE PAIEMENT (Simulé pour le MVP)
     * ═══════════════════════════════════════════════════════
     */
    public function confirmPayment(User $user, int $orderId, array $data)
    {
        $order = Order::with('payment')->find($orderId);

        if (!$order) {
            throw ValidationException::withMessages([
                'order' => ['Commande non trouvée.'],
            ]);
        }

        // Seul le propriétaire de la commande ou un admin peut confirmer le paiement
        if (!$user->isAdmin() && $order->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'permission' => ['Vous n\'êtes pas autorisé à confirmer ce paiement.'],
            ]);
        }

        if (!$order->payment) {
            throw ValidationException::withMessages([
                'payment' => ['Aucun paiement lié à cette commande.'],
            ]);
        }

        $validated = validator($data, [
            'transaction_id' => 'nullable|string|max:255',
        ])->validate();

        if ($order->payment->status === 'completed') {
            throw ValidationException::withMessages([
                'payment' => ['Le paiement a déjà été confirmé.'],
            ]);
        }

        // Mettre à jour le paiement
        $order->payment->update([
            'status' => 'completed',
            'transaction_id' => $validated['transaction_id'] ?? 'TXN-' . time(),
            'paid_at' => now(),
        ]);

        // Mettre à jour la commande
        $order->update(['status' => 'processing']);

        return [
            'message' => 'Paiement confirmé',
            'order' => $order->load(['items.product', 'payment']),
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════
     * DÉTAIL D'UNE COMMANDE CÔTÉ VENDEUR
     * ═══════════════════════════════════════════════════════
     */
    public function getVendorOrderById(User $user, int $id)
    {
        return $this->resolveVendorOrder($user, $id);
    }

    public function updateVendorOrderStatus(User $user, int $id, string $targetStatus)
    {
        if (!in_array($targetStatus, self::VENDOR_ALLOWED_STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => ['Statut invalide pour un vendeur.'],
            ]);
        }

        $order = $this->resolveVendorOrder($user, $id);

        if (in_array($order->status, ['cancelled', 'refunded'], true)) {
            throw ValidationException::withMessages([
                'status' => ['Impossible de modifier une commande annulée ou remboursée.'],
            ]);
        }

        $current = (string) $order->status;
        $allowedTransitions = [
            'pending' => ['processing'],
            'processing' => ['shipped'],
            'shipped' => ['delivered'],
            'delivered' => [],
        ];

        $next = $allowedTransitions[$current] ?? [];
        if (!in_array($targetStatus, $next, true)) {
            throw ValidationException::withMessages([
                'status' => ["Transition invalide: {$current} -> {$targetStatus}."],
            ]);
        }

        $order->update(['status' => $targetStatus]);

        return $this->resolveVendorOrder($user, $id);
    }

    public function updateVendorTracking(User $user, int $id, string $trackingNumber)
    {
        $trackingNumber = trim($trackingNumber);
        if ($trackingNumber === '') {
            throw ValidationException::withMessages([
                'tracking_number' => ['Le numéro de suivi est requis.'],
            ]);
        }

        if (mb_strlen($trackingNumber) > 255) {
            throw ValidationException::withMessages([
                'tracking_number' => ['Le numéro de suivi est trop long.'],
            ]);
        }

        $order = $this->resolveVendorOrder($user, $id);

        if (in_array($order->status, ['cancelled', 'refunded', 'delivered'], true)) {
            throw ValidationException::withMessages([
                'tracking_number' => ['Impossible de modifier le suivi pour ce statut de commande.'],
            ]);
        }

        $order->update([
            'tracking_number' => $trackingNumber,
        ]);

        return $this->resolveVendorOrder($user, $id);
    }
}
