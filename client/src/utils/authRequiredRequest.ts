import { isApiError } from "@/types/api";
import axiosInstance from "./axiosInstance";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import mitt from "mitt";
export const authEvents = mitt();

export async function authRequiredRequest<T = unknown>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    // Verifica autenticación
    await axiosInstance.get("/auth/me");
    // Si pasa, ejecuta la solicitud original
    const response: AxiosResponse<T> = await axiosInstance.request<T>(config);
    return response.data;
  } catch (error: unknown) {
    // Si no autenticado, dispara evento para abrir el Drawer
    if (isApiError(error) && error.response?.status === 401) {
      authEvents.emit("openAccountDrawer");
    }
    throw error;
  }
}
