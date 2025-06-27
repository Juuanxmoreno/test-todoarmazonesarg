import { isApiError, ApiResponse } from "@/types/api";
import { CurrentUserResponse } from "@/interfaces/auth";
import axiosInstance from "./axiosInstance";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import mitt from "mitt";

// Tipos para el evento emitter
type AuthEvents = {
  openAccountDrawer: {
    pendingAction?: () => Promise<unknown>;
    actionType?: string;
  };
};

export const authEvents = mitt<AuthEvents>();

// Variable para almacenar la acción pendiente
let pendingAction: (() => Promise<unknown>) | null = null;
let pendingActionType: string | null = null;

// Función para establecer una acción pendiente
export function setPendingAction(
  action: () => Promise<unknown>,
  actionType?: string
) {
  pendingAction = action;
  pendingActionType = actionType || null;
}

// Función para ejecutar y limpiar la acción pendiente
export async function executePendingAction() {
  if (pendingAction) {
    try {
      const result = await pendingAction();

      // Solo abrir CartDrawer si la acción pendiente era relacionada con el carrito
      if (
        pendingActionType === "cart" &&
        result &&
        typeof result === "object" &&
        "status" in result
      ) {
        const apiResult = result as ApiResponse<unknown>;
        if (apiResult.status === "success") {
          // Pequeño delay para asegurar que el DOM esté listo
          setTimeout(() => {
            const drawerCheckbox = document.getElementById(
              "cart-drawer"
            ) as HTMLInputElement | null;
            if (drawerCheckbox) {
              drawerCheckbox.checked = true;
            }

            // Disparar evento personalizado para que el CartDrawer se actualice
            window.dispatchEvent(
              new CustomEvent("cartUpdatedFromPendingAction")
            );
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error executing pending action:", error);
    } finally {
      pendingAction = null;
      pendingActionType = null;
    }
  }
}

// Función para limpiar la acción pendiente sin ejecutarla
export function clearPendingAction() {
  pendingAction = null;
  pendingActionType = null;
}

// Función para verificar si hay una acción pendiente
export function hasPendingAction(): boolean {
  return pendingAction !== null;
}

export async function authRequiredRequest<T = unknown>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    // Verifica autenticación con la nueva estructura
    const authResponse: AxiosResponse<ApiResponse<CurrentUserResponse>> =
      await axiosInstance.get("/auth/me");

    // Verifica si está autenticado basándose en la respuesta
    const isAuthenticated = authResponse.data.data?.authenticated;

    if (!isAuthenticated) {
      // Crear la acción pendiente que reintentará la request original
      const retryAction = async () => {
        const response: AxiosResponse<T> = await axiosInstance.request<T>(
          config
        );
        return response.data;
      };

      // Establecer la acción pendiente sin tipo específico
      setPendingAction(retryAction);

      // Disparar evento para abrir el Drawer con la acción pendiente
      authEvents.emit("openAccountDrawer", { pendingAction: retryAction });

      throw new Error("Autenticación requerida");
    }

    // Si está autenticado, ejecuta la solicitud original
    const response: AxiosResponse<T> = await axiosInstance.request<T>(config);
    return response.data;
  } catch (error: unknown) {
    // Si hay un error de red u otro tipo, también crear acción pendiente y disparar drawer
    if (isApiError(error)) {
      const retryAction = async () => {
        const response: AxiosResponse<T> = await axiosInstance.request<T>(
          config
        );
        return response.data;
      };

      setPendingAction(retryAction);
      authEvents.emit("openAccountDrawer", { pendingAction: retryAction });
    }
    throw error;
  }
}

// Función específica para operaciones del carrito
export async function authRequiredCartRequest<T = unknown>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    // Verifica autenticación con la nueva estructura
    const authResponse: AxiosResponse<ApiResponse<CurrentUserResponse>> =
      await axiosInstance.get("/auth/me");

    // Verifica si está autenticado basándose en la respuesta
    const isAuthenticated = authResponse.data.data?.authenticated;

    if (!isAuthenticated) {
      // Crear la acción pendiente que reintentará la request original
      const retryAction = async () => {
        const response: AxiosResponse<T> = await axiosInstance.request<T>(
          config
        );
        return response.data;
      };

      // Establecer la acción pendiente CON tipo 'cart'
      setPendingAction(retryAction, "cart");

      // Disparar evento para abrir el Drawer con la acción pendiente
      authEvents.emit("openAccountDrawer", {
        pendingAction: retryAction,
        actionType: "cart",
      });

      throw new Error("Autenticación requerida");
    }

    // Si está autenticado, ejecuta la solicitud original
    const response: AxiosResponse<T> = await axiosInstance.request<T>(config);
    return response.data;
  } catch (error: unknown) {
    // Si hay un error de red u otro tipo, también crear acción pendiente y disparar drawer
    if (isApiError(error)) {
      const retryAction = async () => {
        const response: AxiosResponse<T> = await axiosInstance.request<T>(
          config
        );
        return response.data;
      };

      setPendingAction(retryAction, "cart");
      authEvents.emit("openAccountDrawer", {
        pendingAction: retryAction,
        actionType: "cart",
      });
    }
    throw error;
  }
}
