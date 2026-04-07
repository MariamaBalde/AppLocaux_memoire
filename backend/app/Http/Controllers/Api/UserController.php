<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use App\Models\UserPaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->load(['addresses', 'paymentMethods']),
        ], 200);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'country' => 'nullable|string|max:2',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour',
            'data' => $user->fresh(),
        ], 200);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8',
        ]);

        $user = $request->user();
        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mot de passe actuel incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe mis à jour',
        ], 200);
    }

    public function addresses(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $addresses,
        ], 200);
    }

    public function addAddress(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'zipcode' => 'nullable|string|max:20',
            'city' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_default' => 'sometimes|boolean',
        ]);

        $user = $request->user();
        if (!empty($validated['is_default'])) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Adresse ajoutée',
            'data' => $address,
        ], 201);
    }

    public function updateAddress(Request $request, int $id): JsonResponse
    {
        $address = UserAddress::where('user_id', $request->user()->id)->find($id);
        if (!$address) {
            throw ValidationException::withMessages([
                'address' => ['Adresse non trouvée.'],
            ]);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'sometimes|string',
            'zipcode' => 'nullable|string|max:20',
            'city' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_default' => 'sometimes|boolean',
        ]);

        if (!empty($validated['is_default'])) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Adresse mise à jour',
            'data' => $address->fresh(),
        ], 200);
    }

    public function deleteAddress(Request $request, int $id): JsonResponse
    {
        $address = UserAddress::where('user_id', $request->user()->id)->find($id);
        if (!$address) {
            throw ValidationException::withMessages([
                'address' => ['Adresse non trouvée.'],
            ]);
        }

        $address->delete();

        return response()->json([
            'success' => true,
            'message' => 'Adresse supprimée',
        ], 200);
    }

    public function paymentMethods(Request $request): JsonResponse
    {
        $methods = $request->user()->paymentMethods()->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $methods,
        ], 200);
    }

    public function addPaymentMethod(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'sometimes|string|max:50',
            'provider' => ['required', Rule::in(['wave', 'orange_money', 'stripe', 'paypal', 'visa'])],
            'label' => 'nullable|string|max:255',
            'account_number' => 'required|string|max:255',
            'is_default' => 'sometimes|boolean',
        ]);

        $user = $request->user();
        if (!empty($validated['is_default'])) {
            $user->paymentMethods()->update(['is_default' => false]);
        }

        $method = $user->paymentMethods()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Méthode de paiement ajoutée',
            'data' => $method,
        ], 201);
    }

    public function deletePaymentMethod(Request $request, int $id): JsonResponse
    {
        $method = UserPaymentMethod::where('user_id', $request->user()->id)->find($id);
        if (!$method) {
            throw ValidationException::withMessages([
                'payment_method' => ['Méthode de paiement non trouvée.'],
            ]);
        }

        $method->delete();

        return response()->json([
            'success' => true,
            'message' => 'Méthode de paiement supprimée',
        ], 200);
    }
}
