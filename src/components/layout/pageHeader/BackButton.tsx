import { ArrowLeft } from "lucide-react";
import type { To } from "react-router";

import { useBackNavigation } from "@/hooks/useBackNavigation";
import { Button } from "@/ui";
import { cn } from "@/utils/cn";

interface BackButtonProps {
  fallbackTo: To;
  ariaLabel?: string;
  className?: string;
}

export default function BackButton({
  fallbackTo,
  ariaLabel = "Назад",
  className,
}: BackButtonProps) {
  const goBack = useBackNavigation(fallbackTo);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={goBack}
      aria-label={ariaLabel}
      className={cn("shrink-0 cursor-pointer", className)}
    >
      <ArrowLeft className="size-5" aria-hidden="true" />
    </Button>
  );
}
