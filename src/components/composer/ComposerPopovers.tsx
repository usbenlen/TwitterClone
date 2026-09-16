import {
  ComposerPopover,
  EmojiPicker,
  GifPicker,
  PollComposer,
  LocationPicker,
} from "@/components/composer";

import type { Gif, ComposerPoll, Location } from "@/types";

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

  poll: ComposerPopoverState & {
    poll: ComposerPoll;
    onOptionChange: (id: string, text: string) => void;
    onAddOption: () => void;
    onRemoveOption: (id: string) => void;
    onDurationChange: (minutes: number) => void;
  };

  location: ComposerPopoverState & {
    locations: Location[];
    query: string;
    loading: boolean;
    error: string | null;
    onQueryChange: (value: string) => void;
    onSelect: (location: Location) => void;
  };

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

      <ComposerPopover
        open={poll.open}
        onOpenChange={poll.onOpenChange}
        reference={poll.reference}
      >
        <PollComposer
          poll={poll.poll}
          onOptionChange={poll.onOptionChange}
          onAddOption={poll.onAddOption}
          onRemoveOption={poll.onRemoveOption}
          onDurationChange={poll.onDurationChange}
        />
      </ComposerPopover>

      <ComposerPopover
        open={location.open}
        onOpenChange={location.onOpenChange}
        reference={location.reference}
      >
        <LocationPicker
          locations={location.locations}
          query={location.query}
          loading={location.loading}
          error={location.error}
          onQueryChange={location.onQueryChange}
          onSelect={location.onSelect}
        />
      </ComposerPopover>

    </>
  );
}
