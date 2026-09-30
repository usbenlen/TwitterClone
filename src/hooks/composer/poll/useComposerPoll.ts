import { POLL } from "@/constants/poll";
import { useState } from "react";

import { useComposerPopup } from "@/hooks/composer/useComposerPopup";

import type { ComposerPoll } from "@/types/poll";

function createEmptyPoll(): ComposerPoll {
  return {
    duration: POLL.DEFAULT_DURATION_MINUTES,
    options: Array.from({ length: POLL.MIN_OPTIONS }, () => ({
      id: crypto.randomUUID(),
      text: "",
    })),
  };
}

export function useComposerPoll(initialPoll?: ComposerPoll | null) {
  const popup = useComposerPopup();

  const [poll, setPoll] = useState<ComposerPoll>(
    () => initialPoll ?? createEmptyPoll(),
  );

  const hasPoll = poll.options.some((option) => option.text.trim().length > 0);

  const updateOption = (id: string, text: string) => {
    setPoll((current) => ({
      ...current,

      options: current.options.map((option) =>
        option.id === id
          ? {
              ...option,
              text,
            }
          : option,
      ),
    }));
  };

  const addOption = () => {
    setPoll((current) => {
      if (current.options.length >= POLL.MAX_OPTIONS) return current;

      return {
        ...current,

        options: [
          ...current.options,
          {
            id: crypto.randomUUID(),
            text: "",
          },
        ],
      };
    });
  };

  const removeOption = (id: string) => {
    setPoll((current) => {
      if (current.options.length <= POLL.MIN_OPTIONS) return current;

      return {
        ...current,

        options: current.options.filter((option) => option.id !== id),
      };
    });
  };

  const setDuration = (minutes: number) => {
    setPoll((current) => ({
      ...current,
      duration: minutes,
    }));
  };

  const reset = () => {
    setPoll(createEmptyPoll());
  };

  return {
    ...popup,

    poll,
    hasPoll,

    updateOption,
    addOption,
    removeOption,

    setDuration,
    reset,
  };
}
