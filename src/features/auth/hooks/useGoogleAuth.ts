import { useCallback, useRef, useState } from "react";
import { useLocation } from "react-router";

import { GOOGLE_CLIENT_ID } from "@/features/auth/constants/auth";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { startGoogleRedirect } from "@/features/auth/lib/googleRedirect";

import type { GoogleAuthMode } from "@/features/auth/types";

interface GoogleAuthOptions {
  mode: GoogleAuthMode;
  disabled?: boolean;
  linked?: boolean;
  onBusyChange?: (busy: boolean) => void;
}

export function useGoogleAuth({
  mode,
  disabled = false,
  linked = false,
  onBusyChange,
}: GoogleAuthOptions) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  const start = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || disabled || linked || isLoading || pending.current)
      return;
    pending.current = true;
    setIsBusy(true);
    setError(null);
    onBusyChange?.(true);
    try {
      startGoogleRedirect(mode, user?.id, location.pathname);
    } catch (reason) {
      pending.current = false;
      setIsBusy(false);
      onBusyChange?.(false);
      setError(
        reason instanceof Error
          ? reason.message
          : "Не вдалося відкрити Google. Спробуйте ще раз.",
      );
    }
  }, [
    disabled,
    isLoading,
    linked,
    location.pathname,
    mode,
    onBusyChange,
    user,
  ]);
  return { start, isBusy, error, isLoading };
}
