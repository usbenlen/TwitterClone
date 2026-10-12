import { readGoogleClientId } from "@/config/env";

export const PASSWORD_SUCCESS_REDIRECT_MS = 2_000;
export const GOOGLE_CLIENT_ID = readGoogleClientId(import.meta.env);
export const GOOGLE_ID_TOKEN_MAX_LENGTH = 8192;
export const GOOGLE_REDIRECT_MAX_AGE_MS = 15 * 60 * 1000;
