import { COMPOSER_ACTIONS } from "@/constants/composer";
import type { ComposerAction } from "@/types/composer";
import { cn } from "@/utils/cn";

interface ComposerToolbarProps {
  onAction: (action: ComposerAction) => void;
  allowedActions?: ComposerAction[];
  disabledActions?: ComposerAction[];
  activeActions?: ComposerAction[];
  hiddenActions?: ComposerAction[];
  buttonRefs?: Partial<
    Record<
      ComposerAction,
      | React.RefObject<HTMLButtonElement | null>
      | ((el: HTMLButtonElement | null) => void)
    >
  >;
  disabled?: boolean;
  showEmojiPicker?: boolean;
  className?: string;
}

export default function ComposerToolbar({
  onAction,
  allowedActions,
  disabledActions = [],
  activeActions = [],
  hiddenActions = [],
  buttonRefs = {},
  disabled = false,
  showEmojiPicker = false,
  className = "",
}: ComposerToolbarProps) {
  const filteredActions = COMPOSER_ACTIONS.filter((action) => {
    if (!action.enabled) return false;
    if (hiddenActions.includes(action.id)) return false;
    if (allowedActions && !allowedActions.includes(action.id)) return false;
    return true;
  });

  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-1", className)}>
      {filteredActions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            ref={buttonRefs[action.id]}
            type="button"
            aria-label={action.label}
            aria-expanded={
              action.id === "poll"
                ? activeActions.includes("poll")
                : action.id === "emoji"
                  ? showEmojiPicker
                  : undefined
            }
            disabled={disabled || disabledActions.includes(action.id)}
            onClick={() => onAction(action.id)}
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-50",
              activeActions.includes(action.id) && "bg-primary/10",
            )}
          >
            {Icon ? (
              <Icon size={20} />
            ) : (
              <span className="text-[11px] font-bold tracking-wide">GIF</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
