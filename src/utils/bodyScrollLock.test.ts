import { describe, expect, it } from "vitest";
import { lockBodyScroll } from "@/utils/bodyScrollLock";

describe("overlapping scroll locks", () => {
  it.each([true, false])(
    "restores overflow only after both locks close (parent first: %s)",
    (parentFirst) => {
      const body = { style: { overflow: "scroll" } } as HTMLElement;
      const parent = lockBodyScroll(body);
      const child = lockBodyScroll(body);
      expect(body.style.overflow).toBe("hidden");
      (parentFirst ? parent : child)();
      expect(body.style.overflow).toBe("hidden");
      (parentFirst ? child : parent)();
      expect(body.style.overflow).toBe("scroll");
    },
  );

  it("supports repeated cleanup, remount and an initially locked page", () => {
    const body = { style: { overflow: "hidden" } } as HTMLElement;
    const release = lockBodyScroll(body);
    release();
    release();
    expect(body.style.overflow).toBe("hidden");
    body.style.overflow = "";
    lockBodyScroll(body)();
    expect(body.style.overflow).toBe("");
  });
});
