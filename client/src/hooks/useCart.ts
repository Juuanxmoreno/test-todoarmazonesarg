// src/hooks/useCart.ts

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchCart as fetchCartAction,
  addItemToCart,
  removeItem as removeItemFromCart,
  incrementItem,
  decrementItem,
} from "@/redux/slices/cartSlice";

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { cart, loading, error } = useAppSelector((state) => state.cart);

  const fetchCart = useCallback(() => {
    dispatch(fetchCartAction());
  }, [dispatch]);

  const addItem = useCallback(
    async (productVariantId: string, quantity: number) => {
      try {
        const result = await dispatch(
          addItemToCart({ productVariantId, quantity })
        ).unwrap(); // <- importante: lanza error si la request falla
        return { success: true, cart: result };
      } catch (err) {
        return { success: false, error: err };
      }
    },
    [dispatch]
  );

  const removeItem = useCallback(
    (productVariantId: string) => {
      dispatch(removeItemFromCart({ productVariantId }));
    },
    [dispatch]
  );

  const increment = useCallback(
    (productVariantId: string) => {
      dispatch(incrementItem({ productVariantId }));
    },
    [dispatch]
  );

  const decrement = useCallback(
    (productVariantId: string) => {
      dispatch(decrementItem({ productVariantId }));
    },
    [dispatch]
  );

  return {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    removeItem,
    increment,
    decrement,
  };
};
