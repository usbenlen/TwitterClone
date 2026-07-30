/** @format */

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "@/api/auth.api";
import { setUnauthorizedHandler, clearUnauthorizedHandler } from "@/api/client";
import { tokenStorage } from "@/utils/storage";

import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth";
import type { User } from "@/types/user";

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login(data: LoginRequest): Promise<void>;
  register(data: RegisterRequest): Promise<void>;
  logout(): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStorage.clear();
      setUser(null);
    });

    return () => {
      clearUnauthorizedHandler();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      if (!tokenStorage.hasTokens()) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.me();
        if (mounted) setUser(currentUser);
      } catch {
        tokenStorage.clear();
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const authenticate = useCallback((response: AuthResponse) => {
    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      authenticate(await authApi.login(data));
    },
    [authenticate],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      authenticate(await authApi.register(data));
    },
    [authenticate],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
