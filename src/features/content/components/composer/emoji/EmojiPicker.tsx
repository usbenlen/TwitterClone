import Picker, { Theme } from "emoji-picker-react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  return (
      <Picker
        theme={Theme.AUTO}
        lazyLoadEmojis
        autoFocusSearch={false}
        onEmojiClick={(emoji) => onSelect(emoji.emoji)}
      />
  );
}
