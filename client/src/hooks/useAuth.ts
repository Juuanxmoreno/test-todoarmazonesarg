import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  login,
  logout,
  register,
  fetchCurrentUser,
  resetAuthError,
} from "@/redux/slices/authSlice";

export const useAuth = () => {
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  return {
    user,
    loading,
    error,
    login: (data: { email: string; password: string }) => dispatch(login(data)),
    register: (data: { email: string; password: string }) =>
      dispatch(register(data)),
    logout: () => dispatch(logout()),
    fetchCurrentUser: () => dispatch(fetchCurrentUser()),
    resetAuthError: () => dispatch(resetAuthError()),
  };
};
