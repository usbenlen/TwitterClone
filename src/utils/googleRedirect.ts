import {
  GOOGLE_CLIENT_ID,
  GOOGLE_ID_TOKEN_MAX_LENGTH,
  GOOGLE_REDIRECT_MAX_AGE_MS,
} from "@/constants/auth";
import { APP_ROUTES } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants/storage";
import type { GoogleAuthMode, GoogleRedirectContext } from "@/types/auth";

export class GoogleRedirectError extends Error {
  context?: GoogleRedirectContext;

  constructor(message: string, context?: GoogleRedirectContext) {
    super(message);
    this.name = "GoogleRedirectError";
    this.context = context;
  }
}

function randomValue() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function createGoogleRedirectUrl(
  mode: GoogleAuthMode,
  userId?: string,
  returnTo?: string,
): string {
  if (!GOOGLE_CLIENT_ID)
    throw new GoogleRedirectError("Вхід через Google не налаштовано.");
  if (mode === "link" && !userId)
    throw new GoogleRedirectError(
      "Увійдіть до акаунта, щоб прив’язати Google.",
    );
  const context: GoogleRedirectContext = {
    state: randomValue(),
    nonce: randomValue(),
    mode,
    createdAt: Date.now(),
    userId: mode === "link" ? userId ?? null : null,
    returnTo:
      mode === "link"
        ? returnTo === APP_ROUTES.ADMIN_SETTINGS
          ? APP_ROUTES.ADMIN_SETTINGS
          : APP_ROUTES.SETTINGS
        : APP_ROUTES.HOME,
  };
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: new URL(APP_ROUTES.GOOGLE_CALLBACK, window.location.origin)
      .href,
    response_type: "id_token",
    response_mode: "fragment",
    scope: "openid email profile",
    prompt: "select_account",
    state: context.state,
    nonce: context.nonce,
  }).toString();
  try {
    sessionStorage.setItem(
      STORAGE_KEYS.GOOGLE_REDIRECT,
      JSON.stringify(context),
    );
  } catch {
    throw new GoogleRedirectError(
      "Не вдалося розпочати вхід через Google. Дозвольте збереження даних сайту та спробуйте ще раз.",
    );
  }
  return url.href;
}

export function startGoogleRedirect(
  mode: GoogleAuthMode,
  userId?: string,
  returnTo?: string,
) {
  window.location.assign(createGoogleRedirectUrl(mode, userId, returnTo));
}

function parseContext(raw: string | null): GoogleRedirectContext | null {
  try {
    const context = JSON.parse(raw ?? "null") as GoogleRedirectContext | null;
    if (
      !context ||
      !["signin", "signup", "link"].includes(context.mode) ||
      typeof context.state !== "string" ||
      !/^[a-f0-9]{64}$/.test(context.state) ||
      typeof context.nonce !== "string" ||
      !/^[a-f0-9]{64}$/.test(context.nonce) ||
      !Number.isFinite(context.createdAt) ||
      (context.mode === "link"
        ? typeof context.userId !== "string" ||
          !context.userId ||
          (context.returnTo !== APP_ROUTES.SETTINGS &&
            context.returnTo !== APP_ROUTES.ADMIN_SETTINGS)
        : context.userId !== null || context.returnTo !== APP_ROUTES.HOME)
    )
      return null;
    return context;
  } catch {
    return null;
  }
}

function tokenNonce(idToken: string): unknown {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3 || !parts.every(Boolean)) return undefined;
    const encoded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(
      atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=")),
      (char) => char.charCodeAt(0),
    );
    // This only correlates the response. The backend validates the JWT signature.
    return JSON.parse(new TextDecoder().decode(bytes)).nonce;
  } catch {
    return undefined;
  }
}

export function consumeGoogleCallback(): {
  context: GoogleRedirectContext;
  idToken: string;
} {
  const parameters = new URLSearchParams(window.location.hash.slice(1));
  window.history.replaceState(
    window.history.state,
    "",
    APP_ROUTES.GOOGLE_CALLBACK,
  );
  const context = parseContext(
    sessionStorage.getItem(STORAGE_KEYS.GOOGLE_REDIRECT),
  );
  sessionStorage.removeItem(STORAGE_KEYS.GOOGLE_REDIRECT);
  if (
    !context ||
    Date.now() < context.createdAt ||
    Date.now() - context.createdAt > GOOGLE_REDIRECT_MAX_AGE_MS
  )
    throw new GoogleRedirectError(
      "Спроба авторизації завершена або прострочена. Почніть вхід через Google ще раз.",
    );
  if (
    parameters.getAll("state").length !== 1 ||
    parameters.get("state") !== context.state
  )
    throw new GoogleRedirectError(
      "Не вдалося перевірити цю спробу авторизації. Почніть вхід через Google ще раз.",
      context,
    );
  if (parameters.has("error"))
    throw new GoogleRedirectError(
      parameters.get("error") === "access_denied"
        ? "Авторизацію Google скасовано."
        : "Google не завершив авторизацію. Спробуйте ще раз.",
      context,
    );
  const idToken = parameters.get("id_token");
  if (
    !idToken ||
    parameters.getAll("id_token").length !== 1 ||
    idToken.length > GOOGLE_ID_TOKEN_MAX_LENGTH ||
    tokenNonce(idToken) !== context.nonce
  )
    throw new GoogleRedirectError(
      "Не вдалося перевірити відповідь Google. Почніть авторизацію ще раз.",
      context,
    );
  return { context, idToken };
}
