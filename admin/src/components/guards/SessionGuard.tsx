"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

const SessionGuard: React.FC<Props> = ({ children }) => {
  const { loading, error, isAuthenticated, isAdmin, checkSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      // Solo redirigir si definitivamente no está autenticado o no es admin
      if (!isAuthenticated || !isAdmin) {
        router.replace("/login");
      }
    }
  }, [loading, error, isAuthenticated, isAdmin, router]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-lg font-semibold">
        Verificando permisos de administrador...
      </div>
    );
  }

  // Si hay un error de red o servidor, mostrar el error
  if (error && !isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-red-600 font-semibold">Error de conexión</div>
        <button 
          onClick={() => checkSession()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Si no está autenticado o no es admin, no mostrar contenido (se redirigirá)
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default SessionGuard;
