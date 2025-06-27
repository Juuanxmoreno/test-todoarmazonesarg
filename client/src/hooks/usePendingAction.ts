import { useEffect } from "react";
import { 
  authEvents, 
  hasPendingAction, 
  clearPendingAction,
  executePendingAction 
} from "@/utils/authRequiredRequest";

interface UsePendingActionOptions {
  onPendingAction?: () => void;
  onPendingActionExecuted?: () => void;
}

export const usePendingAction = (options?: UsePendingActionOptions) => {
  const { onPendingAction, onPendingActionExecuted } = options || {};

  useEffect(() => {
    const handleOpenAccountDrawer = (data: { pendingAction?: () => Promise<unknown> }) => {
      if (data.pendingAction && onPendingAction) {
        onPendingAction();
      }
    };

    authEvents.on("openAccountDrawer", handleOpenAccountDrawer);

    return () => {
      authEvents.off("openAccountDrawer", handleOpenAccountDrawer);
    };
  }, [onPendingAction]);

  return {
    hasPendingAction: hasPendingAction(),
    clearPendingAction,
    executePendingAction: async () => {
      await executePendingAction();
      if (onPendingActionExecuted) {
        onPendingActionExecuted();
      }
    },
  };
};
