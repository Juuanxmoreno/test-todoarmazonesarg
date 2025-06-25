import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";
import { OrdersResponse, Order } from "@/interfaces/order";
import { ApiResponse, getErrorMessage } from "@/types/api";
import { OrderStatus } from "@/enums/order.enum";

interface OrderGains {
  totalGainUSD: number;
  orderCount: number;
  fromDate: string;
  toDate: string;
}

interface OrderState {
  orders: Order[];
  nextCursor: string | null;
  loading: boolean;
  error: string | null;
  statusFilter?: OrderStatus;
  gains?: OrderGains;
  gainsLoading?: boolean;
  gainsError?: string | null;
}

const initialState: OrderState = {
  orders: [],
  nextCursor: null,
  loading: false,
  error: null,
  statusFilter: undefined,
  gains: undefined,
  gainsLoading: false,
  gainsError: null,
};

// Thunk para obtener todas las órdenes (con filtro opcional por status)
export const fetchOrders = createAsyncThunk<
  OrdersResponse,
  { status?: OrderStatus; cursor?: string; limit?: number } | undefined,
  { rejectValue: string }
>("orders/fetchOrders", async (params, { rejectWithValue }) => {
  try {
    const query = [];
    if (params?.status) query.push(`status=${params.status}`);
    if (params?.cursor) query.push(`cursor=${params.cursor}`);
    if (params?.limit) query.push(`limit=${params.limit}`);
    const queryString = query.length ? `?${query.join("&")}` : "";
    const response = await axiosInstance.get<ApiResponse<OrdersResponse>>(
      `/orders/all${queryString}`
    );
    if (response.data.status !== "success" || !response.data.data) {
      return rejectWithValue(
        response.data.message || "Error al obtener órdenes"
      );
    }
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateOrderStatus = createAsyncThunk<
  Order,
  { orderId: string; orderStatus: OrderStatus },
  { rejectValue: string }
>(
  "orders/updateOrderStatus",
  async ({ orderId, orderStatus }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Order>>(
        `/orders/${orderId}/status`,
        { orderStatus }
      );
      if (response.data.status !== "success" || !response.data.data) {
        return rejectWithValue(
          response.data.message || "Error al actualizar estado"
        );
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchOrderGains = createAsyncThunk<
  OrderGains,
  { period?: string; fromDate?: string; toDate?: string } | undefined,
  { rejectValue: string }
>("orders/fetchOrderGains", async (params, { rejectWithValue }) => {
  try {
    const query = [];
    if (params?.period) query.push(`period=${params.period}`);
    if (params?.fromDate) query.push(`fromDate=${params.fromDate}`);
    if (params?.toDate) query.push(`toDate=${params.toDate}`);
    const queryString = query.length ? `?${query.join("&")}` : "";
    const response = await axiosInstance.get<ApiResponse<OrderGains>>(
      `/orders/gains${queryString}`
    );
    if (response.data.status !== "success" || !response.data.data) {
      return rejectWithValue(
        response.data.message || "Error al obtener ganancias"
      );
    }
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<OrderStatus | undefined>) {
      state.statusFilter = action.payload;
    },
    resetOrders(state) {
      state.orders = [];
      state.nextCursor = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Si es paginación, concatenar; si no, reemplazar
        if (action.meta.arg?.cursor) {
          state.orders = [...state.orders, ...action.payload.orders];
        } else {
          state.orders = action.payload.orders;
        }
        state.nextCursor = action.payload.nextCursor;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al obtener órdenes";
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        // Actualiza la orden en el array si existe
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) {
          state.orders[idx] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error =
          action.payload || "Error al actualizar estado de la orden";
      })
      .addCase(fetchOrderGains.pending, (state) => {
        state.gainsLoading = true;
        state.gainsError = null;
      })
      .addCase(fetchOrderGains.fulfilled, (state, action) => {
        state.gainsLoading = false;
        state.gains = action.payload;
      })
      .addCase(fetchOrderGains.rejected, (state, action) => {
        state.gainsLoading = false;
        state.gainsError = action.payload || "Error al obtener ganancias";
      });
  },
});

export const { setStatusFilter, resetOrders } = orderSlice.actions;
export default orderSlice.reducer;
