<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Order\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class VendorOrderController extends Controller
{
    public function __construct(private OrderService $orderService)
    {
    }

    /**
     * GET /api/vendor/orders/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $order = $this->orderService->getVendorOrderById($request->user(), $id);

            return response()->json([
                'success' => true,
                'data' => $this->formatVendorOrder($order),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée',
                'errors' => $e->errors(),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la commande vendeur',
            ], 500);
        }
    }

    /**
     * PATCH /api/vendor/orders/{id}/status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string|in:processing,shipped,delivered',
            ]);

            $order = $this->orderService->updateVendorOrderStatus(
                $request->user(),
                $id,
                $validated['status']
            );

            return response()->json([
                'success' => true,
                'message' => 'Statut de la commande mis à jour.',
                'data' => $this->formatVendorOrder($order),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du statut de commande vendeur',
            ], 500);
        }
    }

    /**
     * PATCH /api/vendor/orders/{id}/tracking
     */
    public function updateTracking(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'tracking_number' => 'required|string|max:255',
            ]);

            $order = $this->orderService->updateVendorTracking(
                $request->user(),
                $id,
                $validated['tracking_number']
            );

            return response()->json([
                'success' => true,
                'message' => 'Numéro de suivi mis à jour.',
                'data' => $this->formatVendorOrder($order),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du suivi vendeur',
            ], 500);
        }
    }

    private function formatVendorOrder($order): array
    {
        $vendorSubtotal = (float) $order->items->sum('subtotal');
        $totalItems = (int) $order->items->sum('quantity');

        $items = $order->items->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'product_image' => is_array($item->product?->images) ? ($item->product->images[0] ?? null) : null,
                'quantity' => (int) $item->quantity,
                'price' => (float) $item->price,
                'subtotal' => (float) $item->subtotal,
            ];
        })->values();

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'created_at' => $order->created_at,
            'shipping_method' => $order->shipping_method,
            'shipping_address' => $order->shipping_address,
            'tracking_number' => $order->tracking_number,
            'notes' => $order->notes,
            'customer' => [
                'id' => $order->user?->id,
                'name' => $order->user?->name,
                'email' => $order->user?->email,
                'phone' => $order->user?->phone,
            ],
            'payment' => [
                'method' => $order->payment?->method,
                'status' => $order->payment?->status,
                'transaction_id' => $order->payment?->transaction_id,
                'paid_at' => $order->payment?->paid_at,
            ],
            'summary' => [
                'vendor_subtotal' => round($vendorSubtotal, 2),
                'total_items' => $totalItems,
            ],
            'items' => $items,
        ];
    }
}
