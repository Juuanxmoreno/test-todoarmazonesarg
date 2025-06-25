import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchOrders,
  updateOrderStatus,
  fetchOrderGains,
  setStatusFilter,
  resetOrders,
} from "@/redux/slices/orderSlice";
import { OrderStatus } from "@/enums/order.enum";

const useOrders = () => {
  const dispatch = useAppDispatch();

  // Selectores
  const orders = useAppSelector((state) => state.orders.orders);
  const nextCursor = useAppSelector((state) => state.orders.nextCursor);
  const loading = useAppSelector((state) => state.orders.loading);
  const error = useAppSelector((state) => state.orders.error);
  const statusFilter = useAppSelector((state) => state.orders.statusFilter);
  const gains = useAppSelector((state) => state.orders.gains);
  const gainsLoading = useAppSelector((state) => state.orders.gainsLoading);
  const gainsError = useAppSelector((state) => state.orders.gainsError);

  // Actions
  const getOrders = useCallback(
    (params?: { status?: OrderStatus; cursor?: string; limit?: number }) => {
      dispatch(fetchOrders(params));
    },
    [dispatch]
  );

  const changeOrderStatus = useCallback(
    (orderId: string, orderStatus: OrderStatus) => {
      dispatch(updateOrderStatus({ orderId, orderStatus }));
    },
    [dispatch]
  );

  const getOrderGains = useCallback(
    (params?: { period?: string; fromDate?: string; toDate?: string }) => {
      dispatch(fetchOrderGains(params));
    },
    [dispatch]
  );

  const setFilter = useCallback(
    (status?: OrderStatus) => {
      dispatch(setStatusFilter(status));
    },
    [dispatch]
  );

  const clearOrders = useCallback(() => {
    dispatch(resetOrders());
  }, [dispatch]);

  return {
    orders,
    nextCursor,
    loading,
    error,
    statusFilter,
    gains,
    gainsLoading,
    gainsError,
    getOrders,
    changeOrderStatus,
    getOrderGains,
    setFilter,
    clearOrders,
  };
};

export default useOrders;
