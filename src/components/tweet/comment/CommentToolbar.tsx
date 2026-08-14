/** @format */

import {
    BarChart2,
    Calendar,
    Film,
    Image,
    MapPin,
    Smile,
} from "lucide-react";

interface CommentToolbarProps {
    disabled?: boolean;
    showEmojiPicker: boolean;
    onToggleEmoji: () => void;
}

// тут можна просто константу і потім мапити кнопки (потім зробити)

export default function CommentToolbar({
                                           disabled = false,
                                           showEmojiPicker,
                                           onToggleEmoji,
                                       }: CommentToolbarProps) {
    return (
        <div className="flex items-center gap-1 text-primary">
            <button
                type="button"
                disabled={disabled}
                className="rounded-full p-2 transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50"
                aria-label="Додати зображення"
            >
                <Image size={19} />
            </button>

            <button
                type="button"
                disabled={disabled}
                className="rounded-full p-2 transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50"
                aria-label="GIF"
            >
                <Film size={19} />
            </button>

            <button
                type="button"
                disabled={disabled}
                className="rounded-full p-2 transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50"
                aria-label="Додати опитування"
            >
                <BarChart2
                    size={19}
                    className="rotate-90"
                />
            </button>

            <button
                type="button"
                disabled={disabled}
                onClick={onToggleEmoji}
                className="rounded-full p-2 transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50"
                aria-label="Додати емодзі"
                aria-expanded={showEmojiPicker}
            >
                <Smile size={19} />
            </button>

            <button
                type="button"
                disabled={disabled}
                className="rounded-full p-2 transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50"
                aria-label="Запланувати"
            >
                <Calendar size={19} />
            </button>

            <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-full p-2 opacity-50"
                aria-label="Додати місце"
            >
                <MapPin size={19} />
            </button>
        </div>
    );
}