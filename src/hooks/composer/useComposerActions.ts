/** @format */

import { useRef } from "react";

import type { ComposerAction } from "@/types/composer";

import {
  useComposerPopup,
  useComposerGif,
  useComposerPoll,
} from "@/hooks/composer";

export function useComposerActions() {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const buttonRefs: Partial<
    Record<ComposerAction, React.RefObject<HTMLButtonElement | null>>
  > = {
    emoji: useRef<HTMLButtonElement>(null),
    gif: useRef<HTMLButtonElement>(null),
    poll: useRef<HTMLButtonElement>(null),
    location: useRef<HTMLButtonElement>(null),
  };

  const closeAllPopups = () => {
    emoji.close();
    gif.close();
    poll.close();
    location.close();
  };

  const emoji = useComposerPopup();
  const gif = useComposerGif();
  const poll = useComposerPoll();
  const location = useComposerPopup();

  const handleAction = (action: ComposerAction) => {
    switch (action) {
      case "image":
        imageInputRef.current?.click();
        break;

      case "video":
        videoInputRef.current?.click();
        break;

      case "gif":
        gif.toggle();
        break;

      case "emoji":
        emoji.toggle();
        break;

      case "poll":
        poll.toggle();
        break;

      case "location":
        location.toggle();
        break;
    }
  };

  return {
    imageInputRef,
    videoInputRef,

    buttonRefs,

    handleAction,
    closeAllPopups,

    emoji,
    gif,
    poll,
    location,
  };
}
