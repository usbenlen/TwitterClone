import { describe, expect, it } from "vitest";

import {
  NUMERIC_ENV_DEFAULTS,
  escapeHtml,
  readAppIdentity,
  readGoogleClientId,
  readNumericEnv,
} from "@/shared/config/env";

describe("environment settings", () => {
  it("reads only the configured Google client ID and handles missing values", () => {
    expect(readGoogleClientId({ VITE_GOOGLE_CLIENT_ID: " test-client " })).toBe("test-client");
    expect(readGoogleClientId({})).toBe("");
    expect(readGoogleClientId({ VITE_GOOGLE_CLIENT_ID: "  " })).toBe("");
    expect(readGoogleClientId({ VITE_GOOGLE_CLIENT_ID: true })).toBe("");
  });
  it("uses the documented defaults when numbers are absent", () => {
    expect(readNumericEnv({})).toEqual(NUMERIC_ENV_DEFAULTS);
    expect(readAppIdentity({})).toEqual({ name: "Chirp", locale: "uk-UA" });
  });

  it("accepts positive integers, fractional sizes and boundary quality", () => {
    expect(
      readNumericEnv({
        VITE_MAX_TWEET_LENGTH: " 500 ",
        VITE_MAX_IMAGE_SIZE_MB: "0.5",
        VITE_IMAGE_QUALITY: "1",
      }),
    ).toMatchObject({
      VITE_MAX_TWEET_LENGTH: 500,
      VITE_MAX_IMAGE_SIZE_MB: 0.5,
      VITE_IMAGE_QUALITY: 1,
    });
  });

  it.each(["abc", "", " ", "0", "-1", "Infinity", "NaN", "1.5"])(
    "rejects invalid integer %s and identifies its key",
    (value) => {
      expect(() =>
        readNumericEnv({ VITE_MAX_MEDIA_ATTACHMENTS: value }),
      ).toThrow("VITE_MAX_MEDIA_ATTACHMENTS");
    },
  );

  it.each(["0", "-0.1", "1.01", "Infinity"])("rejects quality %s", (value) => {
    expect(() => readNumericEnv({ VITE_IMAGE_QUALITY: value })).toThrow(
      "VITE_IMAGE_QUALITY",
    );
  });

  it("rejects booleans and unsafe integer settings", () => {
    expect(() => readNumericEnv({ VITE_MAX_NAME_LENGTH: true })).toThrow(
      "VITE_MAX_NAME_LENGTH",
    );
    expect(() =>
      readNumericEnv({
        VITE_IMAGE_MAX_WIDTH: String(Number.MAX_SAFE_INTEGER + 1),
      }),
    ).toThrow("VITE_IMAGE_MAX_WIDTH");
  });

  it("trims identity settings and escapes interpolated HTML", () => {
    expect(
      readAppIdentity({
        VITE_APP_NAME: " Custom App ",
        VITE_APP_LOCALE: " en-GB ",
      }),
    ).toEqual({ name: "Custom App", locale: "en-GB" });
    expect(escapeHtml('<App & "name">')).toBe(
      "&lt;App &amp; &quot;name&quot;&gt;",
    );
  });
});
