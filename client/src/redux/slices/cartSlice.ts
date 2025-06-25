import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type {
  Cart,
  AddItemToCartPayload,
  UpdateCartItemPayload,
} from "@/interfaces/cart";
import type { ApiResponse } from "@/types/api";
import { authRequiredRequest } from "@/utils/authRequiredRequest";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

// 🔄 Obtener carrito actual
export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const response = await authRequiredRequest<ApiResponse<Cart>>({
    method: "GET",
    url: "/cart",
  });
  return response.data!;
});

// ➕ Agregar ítem al carrito
export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async (payload: AddItemToCartPayload) => {
    const response = await authRequiredRequest<ApiResponse<Cart>>({
      method: "POST",
      url: "/cart/add-item",
      data: payload,
    });
    return response.data!;
  }
);

// ⬆️ Incrementar cantidad
export const incrementItem = createAsyncThunk(
  "cart/incrementItem",
  async (payload: UpdateCartItemPayload) => {
    const response = await authRequiredRequest<ApiResponse<Cart>>({
      method: "PATCH",
      url: "/cart/increment-item",
      data: payload,
    });
    return response.data!;
  }
);

// ⬇️ Decrementar cantidad
export const decrementItem = createAsyncThunk(
  "cart/decrementItem",
  async (payload: UpdateCartItemPayload) => {
    const response = await authRequiredRequest<ApiResponse<Cart>>({
      method: "PATCH",
      url: "/cart/decrement-item",
      data: payload,
    });
    return response.data!;
  }
);

// ❌ Eliminar ítem del carrito
export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (payload: UpdateCartItemPayload) => {
    const response = await authRequiredRequest<ApiResponse<Cart>>({
      method: "POST",
      url: "/cart/remove-item",
      data: payload,
    });
    return response.data!;
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.cart = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.error = action.error.message || "Error al obtener el carrito";
        state.loading = false;
      })

      // ADD ITEM
      .addCase(
        addItemToCart.fulfilled,
        (state, action: PayloadAction<Cart>) => {
          state.cart = action.payload;
          state.loading = false;
        }
      )

      // INCREMENT ITEM
      .addCase(
        incrementItem.fulfilled,
        (state, action: PayloadAction<Cart>) => {
          state.cart = action.payload;
          state.loading = false;
        }
      )

      // DECREMENT ITEM
      .addCase(
        decrementItem.fulfilled,
        (state, action: PayloadAction<Cart>) => {
          state.cart = action.payload;
          state.loading = false;
        }
      )

      // REMOVE ITEM
      .addCase(removeItem.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
        state.loading = false;
      });
  },
});

export const { clearCartState } = cartSlice.actions;

export default cartSlice.reducer;
