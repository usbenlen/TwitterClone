import { createContext } from "react";

import type { User } from "@/types/user";
import type {
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
} from "@/types/auth";

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login(data: LoginRequest): Promise<void>;
  register(data: RegisterRequest): Promise<void>;
  verifyEmail(data: VerifyEmailRequest): Promise<void>;
  logout(): Promise<void>;

  updateUser(user: User): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
