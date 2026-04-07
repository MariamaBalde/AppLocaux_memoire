import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

const CartContext = createContext();

function hasAuthToken() {
  return Boolean(localStorage.getItem('token'));
}

function normalizeCart(payload) {
  if (!payload) return { items: [], total: 0 };

  if (Array.isArray(payload)) {
    const total = payload.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
    return { items: payload, total };
  }

  const data = payload.data || payload;
  const items = data.items || data.cart_items || data.cart || [];
  const total = Number(data.total_amount ?? data.total ?? 0);
  return { items: Array.isArray(items) ? items : [], total };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le panier au montage
  useEffect(() => {
    let mounted = true;

    const loadCart = async () => {
      if (!hasAuthToken()) {
        if (mounted) {
          setCartItems([]);
          setCartTotal(0);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const response = await cartService.getCart();
        const normalized = normalizeCart(response);
        if (mounted) {
          setCartItems(normalized.items);
          setCartTotal(normalized.total);
        }
      } catch (error) {
        // Evite de casser l'UI quand l'API est indisponible
        if (mounted) {
          setCartItems([]);
          setCartTotal(0);
        }
        console.error('Erreur chargement panier:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadCart();
    return () => {
      mounted = false;
    };
  }, []);

  // Mettre à jour le total quand les items changent
  useEffect(() => {
    const computedTotal = cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0
    );
    setCartTotal(computedTotal);
  }, [cartItems]);

  const refreshCart = async () => {
    if (!hasAuthToken()) {
      setCartItems([]);
      setCartTotal(0);
      return;
    }

    const response = await cartService.getCart();
    const normalized = normalizeCart(response);
    setCartItems(normalized.items);
    setCartTotal(normalized.total);
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const productId = typeof product === 'object' ? product.id : product;
      await cartService.addToCart(productId, quantity);
      await refreshCart();
      return true;
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      return false;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await cartService.removeFromCart(cartItemId);
      await refreshCart();
      return true;
    } catch (error) {
      console.error('Erreur suppression panier:', error);
      return false;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      if (quantity <= 0) {
        return await removeFromCart(cartItemId);
      }
      await cartService.updateCartItem(cartItemId, quantity);
      await refreshCart();
      return true;
    } catch (error) {
      console.error('Erreur mise a jour panier:', error);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
      setCartTotal(0);
      return true;
    } catch (error) {
      console.error('Erreur vidage panier:', error);
      return false;
    }
  };

  const value = {
    cartItems,
    cartTotal,
    isLoading,
    refreshCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount: cartItems.reduce((count, item) => count + (Number(item.quantity) || 0), 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
