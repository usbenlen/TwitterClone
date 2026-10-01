import { ArrowLeft } from "lucide-react";
import { useNavigate, type To } from "react-router";

import { useBackNavigation } from "@/hooks/useBackNavigation";
import { Button } from "@/ui";
import { cn } from "@/utils/cn";

interface BackButtonProps {
  fallbackTo: To;
  ariaLabel?: string;
  className?: string;
  label?: string;
  mode?: "history" | "destination";
}

export default function BackButton({
  fallbackTo,
  ariaLabel = "Назад",
  className,
  label,
  mode = "history",
}: BackButtonProps) {
  const goBack = useBackNavigation(fallbackTo);
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="ghost"
      size={label ? "comfortable" : "icon"}
      onClick={mode === "destination" ? () => navigate(fallbackTo) : goBack}
      aria-label={label ?? ariaLabel}
      className={cn("shrink-0 cursor-pointer", className)}
    >
      <ArrowLeft className="size-5" aria-hidden="true" />
      {label}
    </Button>
  );
}
