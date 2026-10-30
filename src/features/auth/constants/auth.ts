import { readGoogleClientId } from "@/shared/config/env";

export const AUTH_LIMITS = {
  VERIFICATION_CODE_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 64,
} as const;


export const GOOGLE_CLIENT_ID = readGoogleClientId(import.meta.env);
export const GOOGLE_ID_TOKEN_MAX_LENGTH = 8192;
export const GOOGLE_REDIRECT_MAX_AGE_MS = 15 * 60 * 1000;
