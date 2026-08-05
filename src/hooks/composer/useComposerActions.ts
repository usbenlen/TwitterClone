/** @format */

import { useRef } from "react";

import type { ComposerAction } from "@/types/composer";

export function useComposerActions() {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
        console.log("Emoji picker");
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
    handleAction,
  };
}
