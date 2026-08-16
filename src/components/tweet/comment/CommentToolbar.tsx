import {
  BarChart2,
  Calendar,
  Film,
  Image,
  MapPin,
  Smile,
  type LucideIcon,
} from "lucide-react";

interface CommentToolbarProps {
  disabled?: boolean;
  showEmojiPicker: boolean;
  onToggleEmoji: () => void;
  emojiButtonRef?: (element: HTMLButtonElement | null) => void;
}

interface ToolbarButton {
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  isEmoji?: boolean;
  iconClassName?: string;
}

const BUTTONS: readonly ToolbarButton[] = [
  {
    icon: Image,
    label: "Додати зображення",
  },
  {
    icon: Film,
    label: "GIF",
  },
  {
    icon: BarChart2,
    label: "Додати опитування",
    iconClassName: "rotate-90",
  },
  {
    icon: Smile,
    label: "Додати емодзі",
    isEmoji: true,
  },
  {
    icon: Calendar,
    label: "Запланувати",
  },
  {
    icon: MapPin,
    label: "Додати місце",
    disabled: true,
  },
];

export default function CommentToolbar({
  disabled = false,
  showEmojiPicker,
  onToggleEmoji,
  emojiButtonRef,
}: CommentToolbarProps) {
  return (
    <div className="flex items-center gap-1 text-primary">
      {BUTTONS.map((button) => {
        const Icon = button.icon;

        const isDisabled = disabled || button.disabled;

        return (
          <button
            key={button.label}
            ref={button.isEmoji ? emojiButtonRef : undefined}
            type="button"
            disabled={isDisabled}
            onClick={button.isEmoji ? onToggleEmoji : undefined}
            className={
              button.disabled
                ? "rounded-full p-2 opacity-50"
                : "rounded-full p-2 transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50"
            }
            aria-label={button.label}
            aria-expanded={button.isEmoji ? showEmojiPicker : undefined}
          >
            <Icon size={19} className={button.iconClassName} />
          </button>
        );
      })}
    </div>
  );
}
