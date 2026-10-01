import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VerifiedBadge } from "@/ui/VerifiedBadge";
import type { User } from "@/types/user";

describe("verification badges", () => {
  it.each([false, true])(
    "shows one accessible gray badge for an admin with isVerified=%s",
    (isVerified) => {
      const html = renderToStaticMarkup(
        <VerifiedBadge
          user={{ role: "ADMIN", isVerified }}
          aria-label="Верифікований профіль"
          size={18}
        />,
      );
      expect(html.match(/<svg/g)).toHaveLength(1);
      expect(html).toContain('fill="#8899a6"');
      expect(html).toContain('aria-label="Адміністратор"');
      expect(html).toContain('role="img"');
      expect(html).toContain('aria-hidden="false"');
      expect(html).toContain('width="18"');
      expect(html).not.toContain("#1d9bf0");
    },
  );

  it.each(["USER", undefined] satisfies User["role"][])(
    "keeps ordinary verification blue when role=%s",
    (role) => {
      const html = renderToStaticMarkup(
        <VerifiedBadge user={{ role, isVerified: true }} />,
      );
      expect(html).toContain('fill="#1d9bf0"');
      expect(html).toContain('aria-label="Верифікований профіль"');
    },
  );

  it.each(["USER", undefined] satisfies User["role"][])(
    "does not show a badge for an unverified user when role=%s",
    (role) => {
      expect(
        renderToStaticMarkup(
          <VerifiedBadge user={{ role, isVerified: false }} />,
        ),
      ).toBe("");
    },
  );
});
