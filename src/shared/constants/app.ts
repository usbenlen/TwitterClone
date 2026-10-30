import { readAppIdentity, readNumericEnv } from "@/shared/config/env";

const identity = readAppIdentity(import.meta.env);
export const numericEnv = readNumericEnv(import.meta.env);
export const APP_NAME = identity.name;
export const APP_LOCALE = identity.locale;
