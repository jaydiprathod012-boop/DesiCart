/**
 * CartContext
 * Global cart state — syncs with backend for logged-in users,
 * uses localStorage for guests (merged on login).
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems,   setCartItems]   = useState([]);
  const [totalPrice,  setTotalPrice]  = useState(0);
  const [totalItems,  setTotalItems]  = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  // ── Sync cart whenever user changes ───────────────────────────────────────
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      // Clear cart state on logout
      setCartItems([]);
      setTotalPrice(0);
      setTotalItems(0);
    }
  }, [user]);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      setCartLoading(true);
      const { data } = await api.get("/cart");
      setCartItems(data.cart.items || []);
      setTotalPrice(data.cart.totalPrice || 0);
      setTotalItems(data.cart.totalItems || 0);
    } catch (err) {
      console.error("Failed to fetch cart:", err.message);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  // ── Add to cart ────────────────────────────────────────────────────────────
  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return false;
    }
    try {
      const { data } = await api.post("/cart/add", { productId, quantity });
      setCartItems(data.cart.items);
      setTotalPrice(data.cart.totalPrice);
      setTotalItems(data.cart.totalItems);
      toast.success("Added to cart! 🛒");
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  }, [user]);

  // ── Update quantity ────────────────────────────────────────────────────────
  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      const { data } = await api.put("/cart/update", { productId, quantity });
      setCartItems(data.cart.items);
      setTotalPrice(data.cart.totalPrice);
      setTotalItems(data.cart.totalItems);
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  // ── Remove from cart ───────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (productId) => {
    try {
      const { data } = await api.delete(`/cart/remove/${productId}`);
      setCartItems(data.cart.items);
      setTotalPrice(data.cart.totalPrice);
      setTotalItems(data.cart.totalItems);
      toast.success("Item removed");
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  // ── Clear entire cart ──────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    try {
      await api.delete("/cart/clear");
      setCartItems([]);
      setTotalPrice(0);
      setTotalItems(0);
    } catch (err) {
      console.error("Clear cart error:", err.message);
    }
  }, []);

  const isInCart = useCallback(
    (productId) => cartItems.some((i) => i.product?._id === productId),
    [cartItems]
  );

  return (
    <CartContext.Provider value={{
      cartItems, totalPrice, totalItems, cartLoading,
      addToCart, updateQuantity, removeFromCart, clearCart, fetchCart, isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
