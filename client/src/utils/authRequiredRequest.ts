import { ApiResponse } from "@/types/api";
import { CurrentUserResponse } from "@/interfaces/auth";
import { authEvents } from "@/utils/eventBus";
import axiosInstance from "./axiosInstance";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { IUser } from "@/interfaces/user";

export async function authRequiredRequest<T = unknown>(
  config: AxiosRequestConfig,
  user: IUser | null
): Promise<T> {
  try {
    // Si no hay usuario, verificar autenticación
    if (!user) {
      const authResponse: AxiosResponse<ApiResponse<CurrentUserResponse>> =
        await axiosInstance.get("/auth/me");

      // Verifica si el usuario está autenticado
      if (!authResponse.data.data || !authResponse.data.data.authenticated) {
        // Si no está autenticado, dispara evento para abrir el Drawer
        authEvents.openAccountDrawer();
        throw new Error("Usuario no autenticado");
      }
    }

    // Si está autenticado (o ya teníamos el user), ejecuta la solicitud original
    const response: AxiosResponse<T> = await axiosInstance.request<T>(config);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
}
