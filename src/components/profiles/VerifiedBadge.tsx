import { BadgeCheck, type LucideProps } from "lucide-react";

import {
  ADMIN_BADGE_COLOR,
  VERIFIED_BADGE_COLOR,
} from "@/constants/profile";

import { useAppSelector } from "@/store/hooks";

import { cn } from "@/utils/cn";

import type { User } from "@/types/user";

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
