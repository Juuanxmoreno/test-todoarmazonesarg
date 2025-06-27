import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type {
  Cart,
  AddItemToCartPayload,
  UpdateCartItemPayload,
} from "@/interfaces/cart";
import type { ApiResponse } from "@/types/api";
import { authRequiredCartRequest } from "@/utils/authRequiredRequest";
import { getErrorMessage } from "@/types/api";
import { RootState } from "../store";

interface CartState {
  cart: Cart | null;
  loading: {
    fetch: boolean;
    addItem: boolean;
    increment: boolean;
    decrement: boolean;
    removeItem: boolean;
  };
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: {
    fetch: false,
    addItem: false,
    increment: false,
    decrement: false,
    removeItem: false,
  },
  error: null,
};

// 🔄 Obtener carrito actual
export const fetchCart = createAsyncThunk<
  Cart,
  void,
  { rejectValue: string }
>("cart/fetchCart", async (_, thunkAPI) => {
  try {
    const response = await authRequiredCartRequest<ApiResponse<Cart>>({
      method: "GET",
      url: "/cart",
    });
    if (response.status === "success" && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || "Error al obtener el carrito");
    }
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

// ➕ Agregar ítem al carrito
export const addItemToCart = createAsyncThunk<
  Cart,
  AddItemToCartPayload,
  { rejectValue: string }
>(
  "cart/addItem",
  async (payload, thunkAPI) => {
    try {
      const response = await authRequiredCartRequest<ApiResponse<Cart>>({
        method: "POST",
        url: "/cart/add-item",
        data: payload,
      });
      if (response.status === "success" && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Error al agregar ítem al carrito");
      }
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

// ⬆️ Incrementar cantidad
export const incrementItem = createAsyncThunk<
  Cart,
  UpdateCartItemPayload,
  { rejectValue: string }
>(
  "cart/incrementItem",
  async (payload, thunkAPI) => {
    try {
      const response = await authRequiredCartRequest<ApiResponse<Cart>>({
        method: "PATCH",
        url: "/cart/increment-item",
        data: payload,
      });
      if (response.status === "success" && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Error al incrementar cantidad");
      }
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

// ⬇️ Decrementar cantidad
export const decrementItem = createAsyncThunk<
  Cart,
  UpdateCartItemPayload,
  { rejectValue: string }
>(
  "cart/decrementItem",
  async (payload, thunkAPI) => {
    try {
      const response = await authRequiredCartRequest<ApiResponse<Cart>>({
        method: "PATCH",
        url: "/cart/decrement-item",
        data: payload,
      });
      if (response.status === "success" && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Error al decrementar cantidad");
      }
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

// ❌ Eliminar ítem del carrito
export const removeItem = createAsyncThunk<
  Cart,
  UpdateCartItemPayload,
  { rejectValue: string }
>(
  "cart/removeItem",
  async (payload, thunkAPI) => {
    try {
      const response = await authRequiredCartRequest<ApiResponse<Cart>>({
        method: "POST",
        url: "/cart/remove-item",
        data: payload,
      });
      if (response.status === "success" && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Error al eliminar ítem del carrito");
      }
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.cart = null;
      state.error = null;
      state.loading = {
        fetch: false,
        addItem: false,
        increment: false,
        decrement: false,
        removeItem: false,
      };
    },
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH CART
      .addCase(fetchCart.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
        state.loading.fetch = false;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.error = action.payload || "Error al obtener el carrito";
        state.loading.fetch = false;
      })

      // ADD ITEM
      .addCase(addItemToCart.pending, (state) => {
        state.loading.addItem = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
        state.loading.addItem = false;
        state.error = null;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.error = action.payload || "Error al agregar ítem al carrito";
        state.loading.addItem = false;
      })

      // INCREMENT ITEM
      .addCase(incrementItem.pending, (state) => {
        state.loading.increment = true;
        state.error = null;
      })
      .addCase(incrementItem.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
        state.loading.increment = false;
        state.error = null;
      })
      .addCase(incrementItem.rejected, (state, action) => {
        state.error = action.payload || "Error al incrementar cantidad";
        state.loading.increment = false;
      })

      // DECREMENT ITEM
      .addCase(decrementItem.pending, (state) => {
        state.loading.decrement = true;
        state.error = null;
      })
      .addCase(decrementItem.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
        state.loading.decrement = false;
        state.error = null;
      })
      .addCase(decrementItem.rejected, (state, action) => {
        state.error = action.payload || "Error al decrementar cantidad";
        state.loading.decrement = false;
      })

      // REMOVE ITEM
      .addCase(removeItem.pending, (state) => {
        state.loading.removeItem = true;
        state.error = null;
      })
      .addCase(removeItem.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
        state.loading.removeItem = false;
        state.error = null;
      })
      .addCase(removeItem.rejected, (state, action) => {
        state.error = action.payload || "Error al eliminar ítem del carrito";
        state.loading.removeItem = false;
      });
  },
});

export const { clearCartState, clearCartError } = cartSlice.actions;

// Selectores
export const selectCart = (state: RootState) => state.cart.cart;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectCartFetchLoading = (state: RootState) => state.cart.loading.fetch;
export const selectCartAddItemLoading = (state: RootState) => state.cart.loading.addItem;
export const selectCartIncrementLoading = (state: RootState) => state.cart.loading.increment;
export const selectCartDecrementLoading = (state: RootState) => state.cart.loading.decrement;
export const selectCartRemoveItemLoading = (state: RootState) => state.cart.loading.removeItem;

export default cartSlice.reducer;
