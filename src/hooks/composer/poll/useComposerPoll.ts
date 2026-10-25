import { useRef, useState } from "react";
import { isComposerPollValid } from "@/utils/composer";

import { POLL } from "@/constants/poll";

import { usePollOptionMedia } from "@/hooks/composer/poll/usePollOptionMedia";

import type { ComposerPoll } from "@/types/poll";
import type { ComposerMedia } from "@/types/composer";

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
  const currentPoll = useRef(poll);

  const commit = (update: (current: ComposerPoll) => ComposerPoll) => {
    currentPoll.current = update(currentPoll.current);
    setPoll(currentPoll.current);
  };

  const images = usePollOptionMedia({
    getOption: (id) => currentPoll.current.options.find((option) => option.id === id),
    updateImage: (id: string, image?: ComposerMedia) =>
      commit((current) => ({
        ...current,
        options: current.options.map((option) =>
          option.id === id ? { ...option, image } : option,
        ),
      })),
  });

  const activate = () => {
    activeRef.current = true;
    setIsActive(true);
    firstOptionRef.current?.focus();
  };

  const updateOption = (id: string, text: string) => {
    commit((current) => ({
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
    commit((current) => {
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
    if (currentPoll.current.options.length <= POLL.MIN_OPTIONS) return;
    images.remove(id);
    commit((current) => {
      if (current.options.length <= POLL.MIN_OPTIONS) return current;

      return {
        ...current,

        options: current.options.filter((option) => option.id !== id),
      };
    });
  };

  const setDuration = (minutes: number) => {
    commit((current) => ({
      ...current,
      duration: minutes,
    }));
  };

  const reset = () => {
    images.clear();
    activeRef.current = false;
    setIsActive(false);
    commit(createEmptyPoll);
  };

  return {
    poll,
    getPoll: () => currentPoll.current,
    images,
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
