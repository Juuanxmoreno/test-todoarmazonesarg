import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "@/interfaces/user";
import { AuthResponse, CurrentUserResponse } from "@/interfaces/auth";
import { ApiResponse, getErrorMessage } from "@/types/api";
import axiosInstance from "@/utils/axiosInstance";
import { executePendingAction, clearPendingAction } from "@/utils/authRequiredRequest";

interface AuthState {
  user: IUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// 🔐 Login
export const login = createAsyncThunk<
  IUser,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials
    );
    if (!response.data.data || !response.data.data.user) {
      return rejectWithValue("Respuesta inválida del servidor");
    }
    return response.data.data.user;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// 📝 Registro
export const register = createAsyncThunk<
  IUser,
  { email: string; password: string },
  { rejectValue: string }
>("auth/register", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );
    if (!response.data.data || !response.data.data.user) {
      return rejectWithValue("Respuesta inválida del servidor");
    }
    return response.data.data.user;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// 👤 Obtener usuario actual
export const fetchCurrentUser = createAsyncThunk<
  IUser | null,
  void,
  { rejectValue: string }
>("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ApiResponse<CurrentUserResponse>>(
      "/auth/me"
    );
    
    // La respuesta siempre será exitosa ahora
    if (response.data.status === "success" && response.data.data) {
      return response.data.data.user; // Puede ser null si no hay sesión
    }
    
    return null;
  } catch (error: unknown) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// 🚪 Logout
export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// 🧩 Slice de autenticación
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = false;
        state.user = action.payload;
        // Ejecutar acción pendiente después de login exitoso
        executePendingAction();
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error inesperado";
        // Limpiar acción pendiente si el login falla
        clearPendingAction();
      })

      // Registro
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = false;
        state.user = action.payload;
        // Ejecutar acción pendiente después de registro exitoso
        executePendingAction();
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error inesperado";
        // Limpiar acción pendiente si el registro falla
        clearPendingAction();
      })

      // Obtener usuario actual
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action: PayloadAction<IUser | null>) => {
          state.loading = false;
          state.user = action.payload; // Puede ser null
        }
      )
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload || "Error al verificar sesión";
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        // Limpiar cualquier acción pendiente al hacer logout
        clearPendingAction();
      });
  },
});

export const { resetAuthError } = authSlice.actions;

export default authSlice.reducer;
