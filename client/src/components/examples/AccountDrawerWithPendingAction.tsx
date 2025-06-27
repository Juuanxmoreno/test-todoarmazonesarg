// Ejemplo de cómo usar en tu AccountDrawer o componente de login

import { usePendingAction } from "@/hooks/usePendingAction";
import { useState } from "react";

const AccountDrawer = () => {
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  
  const { hasPendingAction, clearPendingAction } = usePendingAction({
    onPendingAction: () => {
      // Se ejecuta cuando se detecta una acción pendiente
      setShowPendingMessage(true);
    },
    onPendingActionExecuted: () => {
      // Se ejecuta después de completar la acción pendiente
      setShowPendingMessage(false);
      // Opcional: cerrar el drawer automáticamente
      // closeDrawer();
    },
  });

  const handleCancelPendingAction = () => {
    clearPendingAction();
    setShowPendingMessage(false);
  };

  return (
    <div className="drawer-side">
      {/* Mensaje cuando hay una acción pendiente */}
      {showPendingMessage && hasPendingAction && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-800 font-medium text-sm">
                Acción pendiente
              </p>
              <p className="text-blue-600 text-xs mt-1">
                Inicia sesión para completar tu acción anterior
              </p>
            </div>
            <button
              onClick={handleCancelPendingAction}
              className="text-blue-400 hover:text-blue-600 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Resto del contenido del drawer */}
      <div className="login-form">
        {/* Tu formulario de login/registro aquí */}
      </div>
    </div>
  );
};

export default AccountDrawer;
