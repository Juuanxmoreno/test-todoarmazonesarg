type PendingAction = () => Promise<void> | void;

let currentAction: PendingAction | null = null;

export function setPendingAction(action: PendingAction) {
  currentAction = action;
  console.log("📋 Acción pendiente guardada para ejecutar después del login");
}

export async function runPendingAction() {
  if (currentAction) {
    console.log("🚀 Ejecutando acción pendiente...");
    try {
      await currentAction();
      console.log("✅ Acción pendiente ejecutada exitosamente");
    } catch (error) {
      console.error("❌ Error al ejecutar acción pendiente:", error);
    } finally {
      currentAction = null;
    }
  }
}

export function clearPendingAction() {
  if (currentAction) {
    console.log("🗑️ Acción pendiente cancelada");
  }
  currentAction = null;
}
