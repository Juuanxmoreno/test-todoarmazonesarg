"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

const SessionGuard: React.FC<Props> = ({ children }) => {
  const { loading, error, checkSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!loading && error) {
      router.replace("/login");
    }
  }, [loading, error, router]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-lg font-semibold">
        Verificando sesión...
      </div>
    );
  }

  if (error) return null;

  return <>{children}</>;
};

export default SessionGuard;
