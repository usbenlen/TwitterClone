import { BadgeCheck, type LucideProps } from "lucide-react";
import { VERIFIED_BADGE_COLOR } from "@/constants/profile";
import { cn } from "@/utils/cn";

export function VerifiedBadge({ className, ...props }: LucideProps) {
  return (
    <BadgeCheck
      fill={VERIFIED_BADGE_COLOR}
      className={cn("shrink-0 text-background", className)}
      {...props}
    />
  );
}
