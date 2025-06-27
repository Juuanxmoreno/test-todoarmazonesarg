// src/hooks/useCart.ts

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchCart as fetchCartAction,
  addItemToCart,
  removeItem as removeItemFromCart,
  incrementItem,
  decrementItem,
  clearCartError,
  selectCart,
  selectCartLoading,
  selectCartError,
} from "@/redux/slices/cartSlice";

export const useCart = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const loading = useAppSelector(selectCartLoading);
  const error = useAppSelector(selectCartError);

  const fetchCart = useCallback(() => {
    dispatch(fetchCartAction());
  }, [dispatch]);

  const addItem = useCallback(
    async (productVariantId: string, quantity: number) => {
      try {
        const result = await dispatch(
          addItemToCart({ productVariantId, quantity })
        ).unwrap(); // <- importante: lanza error si la request falla
        
        // Abrir CartDrawer automáticamente cuando se agrega exitosamente
        const drawerCheckbox = document.getElementById(
          "cart-drawer"
        ) as HTMLInputElement | null;
        if (drawerCheckbox) {
          drawerCheckbox.checked = true;
        }
        
        return { success: true, cart: result };
      } catch (err) {
        return { success: false, error: err };
      }
    },
    [dispatch]
  );

  const removeItem = useCallback(
    async (productVariantId: string) => {
      try {
        const result = await dispatch(
          removeItemFromCart({ productVariantId })
        ).unwrap();
        return { success: true, cart: result };
      } catch (err) {
        return { success: false, error: err };
      }
    },
    [dispatch]
  );

  const increment = useCallback(
    async (productVariantId: string) => {
      try {
        const result = await dispatch(
          incrementItem({ productVariantId })
        ).unwrap();
        return { success: true, cart: result };
      } catch (err) {
        return { success: false, error: err };
      }
    },
    [dispatch]
  );

  const decrement = useCallback(
    async (productVariantId: string) => {
      try {
        const result = await dispatch(
          decrementItem({ productVariantId })
        ).unwrap();
        return { success: true, cart: result };
      } catch (err) {
        return { success: false, error: err };
      }
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearCartError());
  }, [dispatch]);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    removeItem,
    increment,
    decrement,
    clearError,
  };
};
