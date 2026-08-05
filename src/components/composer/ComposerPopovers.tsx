/** @format */

import ComposerPopover from "@/components/composer/ComposerPopover";

import EmojiPicker from "@/components/composer/emoji/EmojiPicker";
import GifPicker from "@/components/composer/gif/GifPicker";

import type { Gif } from "@/types/gif";

type ComposerPopoverState = {
  open: boolean;
  reference: HTMLElement | null;
  onOpenChange: (open: boolean) => void;
};

interface ComposerPopoversProps {
  emoji: ComposerPopoverState & {
    onSelect: (emoji: string) => void;
  };

  gif: ComposerPopoverState & {
    gifs: Gif[];
    query: string;
    loading: boolean;
    error: string | null;
    onQueryChange: (value: string) => void;
    onSelect: (gif: Gif) => void;
  };

  poll: ComposerPopoverState;

  location: ComposerPopoverState;
}

export default function ComposerPopovers({
  emoji,
  gif,
  poll,
  location,
}: ComposerPopoversProps) {
  return (
    <>
      <ComposerPopover
        open={emoji.open}
        onOpenChange={emoji.onOpenChange}
        reference={emoji.reference}
      >
        <EmojiPicker onSelect={emoji.onSelect} />
      </ComposerPopover>

      <ComposerPopover
        open={gif.open}
        onOpenChange={gif.onOpenChange}
        reference={gif.reference}
      >
        <GifPicker
          gifs={gif.gifs}
          query={gif.query}
          loading={gif.loading}
          error={gif.error}
          onQueryChange={gif.onQueryChange}
          onSelect={gif.onSelect}
        />
      </ComposerPopover>

      {/* <ComposerPopover
        open={poll.open}
        onOpenChange={poll.onOpenChange}
        reference={poll.reference}
      >
        {/*poll* /}
      </ComposerPopover>

      <ComposerPopover
        open={location.open}
        onOpenChange={location.onOpenChange}
        reference={location.reference}
      >
        {/*location* /}
      </ComposerPopover> */}
    </>
  );
}
