<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Cart;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
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

        // Récupérer le panier
        $cartItems = Cart::with('product')->where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Le panier est vide.'],
            ]);
        }

        // Vérifier la disponibilité
        foreach ($cartItems as $item) {
            $product = $item->product;

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

        // Calculer les montants
        $subtotal = $cartItems->sum(function ($item) {
            return $item->product->price * $item->quantity;
        });

        $shippingCost = $this->calculateShippingCost($validated['shipping_method'], $subtotal);
        $total = $subtotal + $shippingCost;

        // Transaction database
        DB::beginTransaction();

        try {
            // Générer le numéro de commande
            $orderNumber = 'CMD-' . date('Y') . '-' . str_pad(Order::count() + 1, 6, '0', STR_PAD_LEFT);

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
                $product = $cartItem->product;

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
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $filters['per_page'] ?? 10;

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
    public function confirmPayment(int $orderId, array $data)
    {
        $order = Order::with('payment')->find($orderId);

        if (!$order) {
            throw ValidationException::withMessages([
                'order' => ['Commande non trouvée.'],
            ]);
        }

        if ($order->payment->status === 'completed') {
            throw ValidationException::withMessages([
                'payment' => ['Le paiement a déjà été confirmé.'],
            ]);
        }

        // Mettre à jour le paiement
        $order->payment->update([
            'status' => 'completed',
            'transaction_id' => $data['transaction_id'] ?? 'TXN-' . time(),
            'paid_at' => now(),
        ]);

        // Mettre à jour la commande
        $order->update(['status' => 'processing']);

        return [
            'message' => 'Paiement confirmé',
            'order' => $order->load(['items.product', 'payment']),
        ];
    }
}