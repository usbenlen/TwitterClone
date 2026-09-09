import {
  BarChart3,
  Image,
  MapPin,
  Smile,
  Video,
  Link2,
  Calendar,
} from "lucide-react";

import {
  ENABLE_GIFS,
  ENABLE_IMAGE_UPLOAD,
  ENABLE_LOCATION,
  ENABLE_POLLS,
  ENABLE_VIDEO_UPLOAD,
  ENABLE_EMBED,
} from "@/constants/app";

import type { ComposerAction } from "@/types/composer";

interface ComposerToolbarProps {
  onAction: (action: ComposerAction) => void;
  allowedActions?: ComposerAction[];
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
  buttonRefs = {},
  disabled = false,
  showEmojiPicker = false,
  className = "",
}: ComposerToolbarProps) {
  const actions = [
    {
      id: "image" as const,
      enabled: ENABLE_IMAGE_UPLOAD,
      label: "Додати зображення",
      icon: <Image size={20} />,
    },
    {
      id: "gif" as const,
      enabled: ENABLE_GIFS,
      label: "GIF",
      icon: <span className="text-[11px] font-bold tracking-wide">GIF</span>,
    },
    {
      id: "video" as const,
      enabled: ENABLE_VIDEO_UPLOAD,
      label: "Додати відео",
      icon: <Video size={20} />,
    },
    {
      id: "poll" as const,
      enabled: ENABLE_POLLS,
      label: "Опитування",
      icon: <BarChart3 size={20} />,
    },
    {
      id: "emoji" as const,
      enabled: true,
      label: "Емодзі",
      icon: <Smile size={20} />,
    },
    {
      id: "schedule" as const,
      enabled: true,
      label: "Запланувати",
      icon: <Calendar size={20} />,
    },
    {
      id: "location" as const,
      enabled: ENABLE_LOCATION,
      label: "Місце",
      icon: <MapPin size={20} />,
    },
    {
      id: "embed" as const,
      enabled: ENABLE_EMBED,
      label: "Вставити",
      icon: <Link2 size={20} />,
    },
  ];

  const filteredActions = actions.filter((action) => {
    if (!action.enabled) return false;
    if (allowedActions && !allowedActions.includes(action.id)) return false;
    return true;
  });

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {filteredActions.map((action) => (
        <button
          key={action.id}
          ref={buttonRefs[action.id]}
          type="button"
          aria-label={action.label}
          aria-expanded={action.id === "emoji" ? showEmojiPicker : undefined}
          disabled={disabled}
          onClick={() => onAction(action.id)}
          className="flex size-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50"
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}
