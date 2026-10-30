// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccountConnections } from "@/features/auth/components/AccountConnections";
import { GoogleAuthButton } from "@/features/auth/components/GoogleAuthButton";

import type { Root } from "react-dom/client";
import type { User } from "@/features/profiles/types/user";

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  clientId: "test-client",
  user: null as User | null,
  isLoading: false,
}));
vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ user: mocks.user, isLoading: mocks.isLoading }),
}));
vi.mock("@/features/auth/lib/googleRedirect", () => ({ startGoogleRedirect: mocks.start }));
vi.mock("@/features/auth/constants/auth", () => ({
  get GOOGLE_CLIENT_ID() {
    return mocks.clientId;
  },
}));
let root: Root;
let host: HTMLDivElement;

async function mount(
  props: Parameters<typeof GoogleAuthButton>[0] = {},
  connections = false,
  linked = false,
) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root.render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: connections ? "/settings" : "/login",
            state: linked ? { googleLinkedUserId: "u1" } : null,
          },
        ]}
      >
        {connections ? <AccountConnections /> : <GoogleAuthButton {...props} />}
      </MemoryRouter>,
    ),
  );
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.start.mockReset();
  mocks.clientId = "test-client";
  mocks.user = null;
  mocks.isLoading = false;
});
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  vi.unstubAllGlobals();
});

describe("Google redirect button", () => {
  it("keeps its outline style and starts one redirect on click", async () => {
    const onBusyChange = vi.fn();
    await mount({ onBusyChange });
    const button = host.querySelector<HTMLButtonElement>("button")!;
    expect(button.classList.contains("h-12")).toBe(true);
    expect(button.classList.contains("bg-background")).toBe(true);
    expect(button.classList.contains("cursor-pointer")).toBe(true);
    act(() => {
      button.click();
      button.click();
    });
    expect(mocks.start).toHaveBeenCalledExactlyOnceWith(
      "signin",
      undefined,
      "/login",
    );
    expect(onBusyChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(button.disabled).toBe(true);
    expect(host.textContent).toContain("Перехід до Google");
    expect(host.querySelector("iframe")).toBeNull();
  });

  it.each(["signin", "signup", "link"] as const)(
    "keeps the %s tooltip button inactive without a Client ID",
    async (mode) => {
      mocks.clientId = "";
      await mount({ mode });
      const button = host.querySelector<HTMLButtonElement>("button")!;
      expect(button.title).toBe("Вхід через Google не налаштовано.");
      expect(button.disabled).toBe(false);
      expect(button.getAttribute("aria-disabled")).toBe("true");
      act(() => {
        button.focus();
        button.click();
      });
      expect(document.activeElement).toBe(button);
      expect(mocks.start).not.toHaveBeenCalled();
      expect(host.textContent).not.toContain("не налаштовано");
    },
  );

  it("keeps linking buttons rounded-sm and sends the current user and settings path", async () => {
    mocks.user = { id: "u1" } as User;
    await mount({}, true);
    const google = host.querySelector<HTMLButtonElement>(
      "button[aria-label='Продовжити з Google']",
    )!;
    expect(google.classList.contains("rounded-sm")).toBe(true);
    for (const name of ["Apple", "GitHub"]) {
      const button = host.querySelector<HTMLButtonElement>(
        `button[aria-label^='${name}']`,
      )!;
      expect(button.disabled).toBe(true);
      expect(button.classList.contains("rounded-sm")).toBe(true);
      expect(button.parentElement!.title).toBe("Незабаром");
    }
    act(() => google.click());
    expect(mocks.start).toHaveBeenCalledExactlyOnceWith(
      "link",
      "u1",
      "/settings",
    );
  });

  it("shows the one-time link confirmation and does not start another operation", async () => {
    mocks.user = { id: "u1" } as User;
    await mount({}, true, true);
    expect(host.textContent).toContain("Google успішно прив’язано.");
    act(() =>
      host
        .querySelector<HTMLButtonElement>(
          "button[aria-label='Продовжити з Google']",
        )!
        .click(),
    );
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it("allows retry when starting navigation fails", async () => {
    mocks.start.mockImplementationOnce(() => {
      throw new Error("Storage unavailable");
    });
    await mount();
    const button = host.querySelector<HTMLButtonElement>("button")!;
    act(() => button.click());
    expect(host.querySelector("[role=alert]")!.textContent).toBe(
      "Storage unavailable",
    );
    expect(button.disabled).toBe(false);
    act(() => button.click());
    expect(mocks.start).toHaveBeenCalledTimes(2);
  });
});
