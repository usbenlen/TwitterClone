import { BadgeCheck } from "lucide-react";

import {
  ADMIN_BADGE_COLOR,
  VERIFIED_BADGE_COLOR,
} from "@/features/profiles/constants/profile";
import { cn } from "@/shared/lib/cn";
import { useAppSelector } from "@/shared/store/hooks";

import type { LucideProps } from "lucide-react";
import type { User } from "@/features/profiles/types";

type VerifiedBadgeProps = LucideProps & {
  user: Pick<User, "id" | "role" | "isVerified">;
};

export function VerifiedBadge({ user, className, ...props }: VerifiedBadgeProps) {
  const sessionUser = useAppSelector((state) =>
    state.auth.user?.id === user.id ? state.auth.user : null,
  );
  const role = sessionUser?.role ?? user.role;
  const isAdmin = role === "Admin";
  if (!isAdmin && !user.isVerified) return null;

  return (
    <BadgeCheck
      {...props}
      fill={isAdmin ? ADMIN_BADGE_COLOR : VERIFIED_BADGE_COLOR}
      className={cn("shrink-0 text-background", className)}
      role="img"
      aria-hidden={false}
      aria-label={
        isAdmin ? "Адміністратор" : (props["aria-label"] ?? "Верифікований профіль")
      }
    />
  );
}
