/** @format */

import { useMemo, useState, useRef } from "react";

import { tweetApi } from "@/api/tweet.api";

import type { Tweet } from "@/types/tweet";
import type { ComposerAction } from "@/types/composer";

import { MAX_TWEET_LENGTH } from "@/constants/app";

interface UseTweetComposerProps {
  onCreated: (tweet: Tweet) => void;
}

export function useTweetComposer({ onCreated }: UseTweetComposerProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const remaining = useMemo(() => MAX_TWEET_LENGTH - content.length, [content]);

  const canSubmit = content.trim().length > 0 && remaining >= 0 && !isPosting;

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!canSubmit) return;

    setIsPosting(true);

    try {
      const tweet = await tweetApi.create(content.trim());

      onCreated(tweet);

      setContent("");
    } finally {
      setIsPosting(false);
    }
  };

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
    content,
    setContent,

    remaining,

    canSubmit,

    isPosting,

    submit,
    imageInputRef,
    videoInputRef,
    handleAction,
  };
}
