<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Order\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Crée une commande depuis le panier
     * POST /api/orders
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $result = $this->orderService->createOrderFromCart(
                $request->user(),
                $request->all()
            );

            return response()->json([
                'success' => true,
                'message' => 'Commande créée avec succès',
                'data' => $result
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
                'message' => 'Erreur lors de la création de la commande',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Liste les commandes de l'utilisateur
     * GET /api/orders
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->all();
            $orders = $this->orderService->getUserOrders($request->user(), $filters);

            return response()->json([
                'success' => true,
                'data' => $orders
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des commandes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Affiche une commande spécifique
     * GET /api/orders/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $order = $this->orderService->getOrderById($request->user(), $id);

            return response()->json([
                'success' => true,
                'data' => $order
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Commande non trouvée',
                'errors' => $e->errors()
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la commande',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Annule une commande
     * PATCH /api/orders/{id}/cancel
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        try {
            $result = $this->orderService->cancelOrder($request->user(), $id);

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result['order']
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
                'message' => 'Erreur lors de l\'annulation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirme le paiement d'une commande
     * POST /api/orders/{id}/confirm-payment
     */
    public function confirmPayment(Request $request, int $id): JsonResponse
    {
        try {
            $result = $this->orderService->confirmPayment($request->user(), $id, $request->all());

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result['order']
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
                'message' => 'Erreur lors de la confirmation du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
