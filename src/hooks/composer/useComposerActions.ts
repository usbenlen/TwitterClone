/** @format */

import { useRef } from "react";

import type { ComposerAction } from "@/types/composer";

import { useComposerEmoji } from "@/hooks/composer/useComposerEmoji";

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

  const emoji = useComposerEmoji();

  const handleAction = (action: ComposerAction) => {
    switch (action) {
      case "image":
        imageInputRef.current?.click();
        break;

      case "video":
        videoInputRef.current?.click();
        break;

      case "gif":
        console.log("GIF picker");
        break;

      case "emoji":
        emoji.toggle();
        break;

      case "poll":
        console.log("Poll");
        break;

      case "location":
        console.log("Location");
        break;
    }
  };

  return {
    imageInputRef,
    videoInputRef,

    buttonRefs,

    handleAction,

    emoji,
  };
}
