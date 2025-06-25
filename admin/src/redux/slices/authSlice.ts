import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";
import { ApiResponse, getErrorMessage } from "@/types/api";
import { LoginPayload } from "@/interfaces/auth";
import { AuthResponse } from "@/interfaces/auth";
import { IUser } from "@/interfaces/user";

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

// Check session thunk
export const checkSession = createAsyncThunk<
  IUser,
  void,
  { rejectValue: string }
>("auth/checkSession", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get<ApiResponse<AuthResponse>>(
      "/auth/me-admin"
    );
    if (res.data.status !== "success" || !res.data.data?.user) {
      return rejectWithValue(res.data.message || "No session");
    }
    return res.data.data.user;
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
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      // Check session
      .addCase(checkSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload || "No session";
      })
      // Logout
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Logout failed";
      });
  },
});

// Exporta solo los thunks que no han sido exportados antes
export default authSlice.reducer;
