export const NUMERIC_ENV_DEFAULTS = {
  VITE_MAX_TWEET_LENGTH: 280,
  VITE_MAX_NAME_LENGTH: 100,
  VITE_MAX_BIO_LENGTH: 160,
  VITE_MAX_MEDIA_ATTACHMENTS: 4,
  VITE_MAX_IMAGE_SIZE_MB: 10,
  VITE_MAX_VIDEO_SIZE_MB: 100,
  VITE_MAX_GIF_SIZE_MB: 10,
  VITE_IMAGE_MAX_WIDTH: 2048,
  VITE_IMAGE_QUALITY: 0.8,
} as const;

type NumericKey = keyof typeof NUMERIC_ENV_DEFAULTS;
type Env = Record<string, string | boolean | undefined>;
export type NumericEnv = { [Key in NumericKey]: number };

const INTEGER_KEYS = new Set<NumericKey>([
  "VITE_MAX_TWEET_LENGTH",
  "VITE_MAX_NAME_LENGTH",
  "VITE_MAX_BIO_LENGTH",
  "VITE_MAX_MEDIA_ATTACHMENTS",
  "VITE_IMAGE_MAX_WIDTH",
]);

export function readNumericEnv(env: Env): NumericEnv {
  const result = {} as NumericEnv;
  for (const key of Object.keys(NUMERIC_ENV_DEFAULTS) as NumericKey[]) {
    const raw = env[key];
    const value = raw === undefined ? NUMERIC_ENV_DEFAULTS[key] : Number(raw);
    if (
      typeof raw === "boolean" ||
      !Number.isFinite(value) ||
      value <= 0 ||
      (INTEGER_KEYS.has(key) && !Number.isSafeInteger(value)) ||
      (key === "VITE_IMAGE_QUALITY" && value > 1)
    ) {
      throw new Error(`Invalid environment variable: ${key}`);
    }
    result[key] = value;
  }
  return result;
}

export function readAppIdentity(env: Env) {
  return {
    name: String(env.VITE_APP_NAME ?? "").trim() || "Chirp",
    locale: String(env.VITE_APP_LOCALE ?? "").trim() || "uk-UA",
  };
}

export function readMockUserRole(env: Env): "User" | "Admin" {
  const role = env.VITE_MOCK_USER_ROLE ?? "USER";
  if (role !== "USER" && role !== "ADMIN") throw new Error("Invalid environment variable: VITE_MOCK_USER_ROLE");
  return role === "ADMIN" ? "Admin" : "User";
}

export function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}
