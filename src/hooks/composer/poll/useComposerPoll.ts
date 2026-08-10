/** @format */

import { useState } from "react";

import { useComposerPopup } from "@/hooks/composer/useComposerPopup";

import type { ComposerPoll } from "@/types/poll";

const DEFAULT_DURATION = 1440;

export function useComposerPoll() {
  const popup = useComposerPopup();

  const [poll, setPoll] = useState<ComposerPoll>({
    duration: DEFAULT_DURATION,

    options: [
      {
        id: crypto.randomUUID(),
        text: "",
      },
      {
        id: crypto.randomUUID(),
        text: "",
      },
    ],
  });

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
      if (current.options.length >= 4) return current;

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
      if (current.options.length <= 2) return current;

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
    setPoll({
      duration: DEFAULT_DURATION,

      options: [
        {
          id: crypto.randomUUID(),
          text: "",
        },
        {
          id: crypto.randomUUID(),
          text: "",
        },
      ],
    });
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
