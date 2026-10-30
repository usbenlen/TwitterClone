import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { googleAuthError } from "@/features/auth/lib/googleAuthError";
import {
  GoogleRedirectError,
  consumeGoogleCallback,
  startGoogleRedirect,
} from "@/features/auth/lib/googleRedirect";
import { APP_ROUTES } from "@/shared/config/routes";
import { tokenStorage } from "@/shared/lib/tokenStorage";
import { useAppStore } from "@/shared/store/hooks";

import type { GoogleRedirectContext } from "@/features/auth/types";

type CapturedCallback =
  | { ok: true; result: ReturnType<typeof consumeGoogleCallback> }
  | { ok: false; error: unknown };

export function useGoogleCallback() {
  const { user, isLoading, loginWithGoogle, linkGoogle } = useAuth();
  const store = useAppStore();
  const navigate = useNavigate();
  const [context, setContext] = useState<GoogleRedirectContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(true);
  const captured = useRef<CapturedCallback | null>(null);
  const started = useRef(false);
  const mounted = useRef(false);
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      started.current = false;
      request.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!captured.current) {
      try {
        captured.current = { ok: true, result: consumeGoogleCallback() };
      } catch (reason) {
        captured.current = { ok: false, error: reason };
      }
    }
    if (isLoading || started.current) return;
    started.current = true;
    const callback = captured.current;
    const controller = new AbortController();
    request.current = controller;
    const finish = async () => {
      // Yield before requests so a StrictMode cleanup can cancel the first setup.
      await Promise.resolve();
      if (controller.signal.aborted || !mounted.current) return;
      if (!callback.ok) {
        if (callback.error instanceof GoogleRedirectError)
          setContext(callback.error.context ?? null);
        throw callback.error;
      }
      const { context: pending, idToken } = callback.result;
      setContext(pending);
      const currentUser = store.getState().auth.user;
      if (pending.mode === "link") {
        if (!currentUser || currentUser.id !== pending.userId)
          throw new GoogleRedirectError(
            "Акаунт змінився. Увійдіть до потрібного акаунта та почніть прив’язку Google ще раз.",
            pending,
          );
        const completed = await linkGoogle({ idToken }, controller.signal);
        if (controller.signal.aborted || !mounted.current) return;
        if (!completed)
          throw new GoogleRedirectError(
            "Сесія змінилася. Почніть прив’язку Google ще раз.",
            pending,
          );
        navigate(pending.returnTo, {
          replace: true,
          state: { googleLinkedUserId: pending.userId },
        });
      } else {
        if (currentUser) {
          navigate(APP_ROUTES.HOME, { replace: true });
          return;
        }
        if (tokenStorage.hasTokens()) {
          window.location.replace(APP_ROUTES.HOME);
          return;
        }
        const completed = await loginWithGoogle({ idToken }, controller.signal);
        if (controller.signal.aborted || !mounted.current) return;
        if (!completed) {
          if (tokenStorage.hasTokens()) {
            window.location.replace(APP_ROUTES.HOME);
            return;
          }
          throw new GoogleRedirectError(
            "Сесія змінилася. Почніть вхід через Google ще раз.",
            pending,
          );
        }
        navigate(APP_ROUTES.HOME, { replace: true });
      }
    };
    void finish().catch((reason) => {
      if (controller.signal.aborted || !mounted.current) return;
      setError(
        reason instanceof GoogleRedirectError
          ? reason.message
          : googleAuthError(
              reason,
              callback.ok && callback.result.context.mode === "link",
            ),
      );
      setIsBusy(false);
    });
  }, [isLoading, linkGoogle, loginWithGoogle, navigate, store]);

  const canRetry = context?.mode !== "link" || user?.id === context.userId;
  const retry = useCallback(() => {
    if (!canRetry) return;
    setIsBusy(true);
    setError(null);
    try {
      startGoogleRedirect(
        context?.mode ?? "signin",
        user?.id,
        context?.returnTo,
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Не вдалося відкрити Google. Спробуйте ще раз.",
      );
      setIsBusy(false);
    }
  }, [canRetry, context, user]);

  return {
    isBusy,
    error,
    context,
    canRetry,
    retry,
    backTo:
      context?.mode === "link" && user ? context.returnTo : APP_ROUTES.LOGIN,
  };
}
