/** @format */

import ComposerPopover from "@/components/composer/ComposerPopover";
import EmojiPicker from "@/components/composer/emoji/EmojiPicker";

interface ComposerPopoversProps {
  emoji: {
    open: boolean;
    reference: HTMLElement | null;
    onOpenChange: (open: boolean) => void;
    onSelect: (emoji: string) => void;
  };

  // gif
  // poll
  // location
}

export default function ComposerPopovers({ emoji }: ComposerPopoversProps) {
  return (
    <>
      <ComposerPopover
        open={emoji.open}
        onOpenChange={emoji.onOpenChange}
        reference={emoji.reference}
      >
        <EmojiPicker onSelect={emoji.onSelect} />
      </ComposerPopover>

      {/* GIF */}
      {/* Poll */}
      {/* Location */}
    </>
  );
}
