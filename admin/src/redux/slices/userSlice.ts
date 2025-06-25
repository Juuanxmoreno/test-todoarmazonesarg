import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";
import { ApiResponse, getErrorMessage } from "@/types/api";
import { IGetUsersPaginatedResponse, IUser } from "@/interfaces/user";

interface UserState {
  users: IUser[];
  nextCursor: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  nextCursor: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk<
  IGetUsersPaginatedResponse,
  { limit?: number; cursor?: string },
  { rejectValue: string }
>("users/fetchUsers", async ({ limit = 10, cursor }, { rejectWithValue }) => {
  try {
    const params: { limit: number; cursor?: string } = { limit };
    if (cursor) params.cursor = cursor;
    const res = await axiosInstance.get<
      ApiResponse<IGetUsersPaginatedResponse>
    >("/users", { params });
    if (res.data.status !== "success" || !res.data.data) {
      return rejectWithValue(res.data.message || "Error al obtener usuarios");
    }
    return res.data.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetUsers: (state) => {
      state.users = [];
      state.nextCursor = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Si es la primera página (sin cursor), reemplaza. Si no, acumula.
        if (action.meta.arg && action.meta.arg.cursor) {
          state.users = [...state.users, ...action.payload.users];
        } else {
          state.users = action.payload.users;
        }
        state.nextCursor = action.payload.nextCursor;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error al obtener usuarios";
      });
  },
});

export const { resetUsers } = userSlice.actions;
export default userSlice.reducer;
