import { POLL } from "@/constants/poll";
import { useRef, useState } from "react";
import { isComposerPollValid } from "@/utils/composer";

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
  const [isActive, setIsActive] = useState(Boolean(initialPoll));
  const activeRef = useRef(Boolean(initialPoll));
  const firstOptionRef = useRef<HTMLInputElement>(null);

  const [poll, setPoll] = useState<ComposerPoll>(
    () => initialPoll ?? createEmptyPoll(),
  );

  const activate = () => {
    activeRef.current = true;
    setIsActive(true);
    firstOptionRef.current?.focus();
  };

  const updateOption = (id: string, text: string) => {
    setPoll((current) => ({
      ...current,

      options: current.options.map((option) =>
        option.id === id
          ? {
              ...option,
              text: Array.from(text).slice(0, POLL.MAX_OPTION_LENGTH).join(""),
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
    activeRef.current = false;
    setIsActive(false);
    setPoll(createEmptyPoll());
  };

  return {
    poll,
    isActive,
    getIsActive: () => activeRef.current,
    isValid: isComposerPollValid(poll),
    firstOptionRef,
    activate,

    updateOption,
    addOption,
    removeOption,

    setDuration,
    reset,
  };
}
