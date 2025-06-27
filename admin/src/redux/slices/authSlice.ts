import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";
import { ApiResponse, getErrorMessage } from "@/types/api";
import { LoginPayload } from "@/interfaces/auth";
import { AuthResponse, AdminCheckResponse } from "@/interfaces/auth";
import { IUser } from "@/interfaces/user";

interface AuthState {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
};

// Login thunk
export const login = createAsyncThunk<
  IUser,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post<ApiResponse<AuthResponse>>(
      "/auth/login-admin",
      payload
    );
    if (res.data.status !== "success" || !res.data.data?.user) {
      return rejectWithValue(res.data.message || "Login failed");
    }
    return res.data.data.user;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

//Check session thunk
export const checkSession = createAsyncThunk<
  AdminCheckResponse,
  void,
  { rejectValue: string }
>("auth/checkSession", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get<ApiResponse<AdminCheckResponse>>(
      "/auth/me-admin"
    );
    
    // La respuesta siempre será exitosa ahora
    if (res.data.status === "success" && res.data.data) {
      return res.data.data;
    }
    
    // Si por alguna razón no hay data, devolver estado no autenticado
    return {
      user: null,
      authenticated: false,
      isAdmin: false,
    };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// Logout thunk
export const logoutAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post<ApiResponse>("/auth/logout");
    if (res.data.status !== "success") {
      return rejectWithValue(res.data.message || "Logout failed");
    }
    return;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Elimina el método logout aquí, ya que el logout real ahora es asíncrono
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAdmin = true; // Si logra hacer login como admin, es admin
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
        state.isAdmin = false;
      })
      // Check session
      .addCase(checkSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.authenticated;
        state.isAdmin = action.payload.isAdmin;
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.error = action.payload || "Error al verificar sesión";
      })
      // Logout
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Logout failed";
      });
  },
});

// Exporta solo los thunks que no han sido exportados antes
export default authSlice.reducer;
