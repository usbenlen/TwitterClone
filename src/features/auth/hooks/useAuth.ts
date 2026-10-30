import { useCallback } from "react";

import { authApi } from "@/features/auth/api";
import {
  authCleared,
  authReady,
  authUserUpdated,
} from "@/features/auth/model/authState";
import { updateCachedProfileAuthors } from "@/features/content/api/postQueries";
import { profileQueries } from "@/features/profiles/api/profileQueries";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";
import { tokenStorage } from "@/shared/lib/tokenStorage";
import {
  useAppDispatch,
  useAppSelector,
  useAppStore,
} from "@/shared/store/hooks";
import { sessionChanged, sessionGeneration } from "@/shared/store/session";

import type {
  AuthResponse,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
} from "@/features/auth/types";
import type { User } from "@/features/profiles/types";

export function useAuth() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const authenticate = useCallback(
    async (response: AuthResponse, signal?: AbortSignal) => {
      signal?.throwIfAborted();
      dispatch(sessionChanged());
      const generation = sessionGeneration(store.getState());
      tokenStorage.setTokens(response.accessToken, response.refreshToken);
      try {
        const currentUser = await authApi.me(signal);
        signal?.throwIfAborted();

        if (generation !== sessionGeneration(store.getState())) return false;
        dispatch(authReady(currentUser));
        return true;
      } catch (error) {
        if (generation !== sessionGeneration(store.getState())) return false;

        tokenStorage.clear();
        dispatch(sessionChanged());
        dispatch(authCleared());
        throw error;
      }
    },
    [dispatch, store],
  );

  const login = useCallback(
    async (data: LoginRequest) => {
      await authenticate(await authApi.login(data));
    },
    [authenticate],
  );

  const register = useCallback(async (data: RegisterRequest) => {
    await authApi.register(data);
  }, []);

  const loginWithGoogle = useCallback(
    async (data: GoogleLoginRequest, signal?: AbortSignal) => {
      const generation = sessionGeneration(store.getState());
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();
      let response: AuthResponse;
      try {
        response = await authApi.loginWithGoogle(data, signal);
      } catch (error) {
        if (signal?.aborted || generation !== sessionGeneration(store.getState()))
          return false;
        throw error;
      }
      if (signal?.aborted || generation !== sessionGeneration(store.getState()))
        return false;
      if (accessToken !== tokenStorage.getAccessToken() || refreshToken !== tokenStorage.getRefreshToken())
        return false;
      return authenticate(response, signal);
    },
    [authenticate, store],
  );

  const linkGoogle = useCallback(
    async (data: GoogleLoginRequest, signal?: AbortSignal) => {
      const generation = sessionGeneration(store.getState());
      if (!store.getState().auth.user || signal?.aborted) return false;
      try {
        await authApi.linkGoogle(data, signal);
        return !signal?.aborted && generation === sessionGeneration(store.getState());
      } catch (error) {
        if (signal?.aborted || generation !== sessionGeneration(store.getState()))
          return false;
        throw error;
      }
    },
    [store],
  );

  const verifyEmail = useCallback(
    async (data: VerifyEmailRequest) => {
      await authenticate(await authApi.verifyEmail(data));
    },
    [authenticate],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStorage.clear();
      dispatch(sessionChanged());
      dispatch(authCleared());
    }
  }, [dispatch]);

  const updateUser = useCallback(
    (updatedUser: User) => {
      dispatch(authUserUpdated(updatedUser));
      if (MOCK_ENABLED) updateCachedProfileAuthors(updatedUser, dispatch, store.getState());
      dispatch(
        profileQueries.util.upsertQueryData(
          "getProfile",
          updatedUser.username,
          updatedUser,
        ),
      );
    },
    [dispatch, store],
  );

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    loginWithGoogle,
    linkGoogle,
    register,
    verifyEmail,
    logout,
    updateUser,
  };
}
