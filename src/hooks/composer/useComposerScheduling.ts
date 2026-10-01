import { useState } from "react";
import { useScheduledPosts } from "@/hooks/useScheduledPosts";
import type { useComposerPopup } from "@/hooks/composer/useComposerPopup";
import {
  buildScheduledPostPayload,
  type ComposerValues,
} from "@/utils/composer";
import type { UpdateScheduledPostRequest } from "@/types";

interface SchedulingOptions {
  popup: ReturnType<typeof useComposerPopup>;
  initialScheduledAt: string | null;
  enabled: boolean;
  submitLabel: string;
  showScheduledPostsLink: boolean;
  canClear: boolean;
  onSubmit?: (data: UpdateScheduledPostRequest) => Promise<unknown>;
}

export function useComposerScheduling(options: SchedulingOptions) {
  const [scheduledAt, setScheduledAt] = useState(options.initialScheduledAt);
  const [draftAt, setDraftAt] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const posts = useScheduledPosts();
  const popup = options.popup;

  const submit = async (values: ComposerValues) => {
    if (!scheduledAt) return;
    setIsScheduling(true);
    try {
      const payload = buildScheduledPostPayload(values, scheduledAt);
      return await (options.onSubmit
        ? options.onSubmit(payload)
        : posts.create(payload));
    } finally {
      setIsScheduling(false);
    }
  };

  return {
    scheduledAt,
    isScheduling,
    submit,
    reset: () => setScheduledAt(null),
    scheduling: {
      enabled: options.enabled,
      open: popup.isOpen,
      scheduledAt,
      modalInitialAt: draftAt ?? scheduledAt,
      listOpen,
      submitLabel: options.submitLabel,
      showScheduledPostsLink: options.showScheduledPostsLink,
      canClear: options.canClear,
      onOpenChange: (open: boolean) => {
        if (open) popup.open();
        else {
          popup.close();
          setDraftAt(null);
        }
      },
      apply: (value: string) => {
        setScheduledAt(value);
        setDraftAt(null);
        popup.close();
      },
      clear: () => {
        setScheduledAt(null);
        setDraftAt(null);
        popup.close();
      },
      openList: (value: string) => {
        setDraftAt(value);
        popup.close();
        setListOpen(true);
      },
      backToSchedule: () => {
        setListOpen(false);
        popup.open();
      },
      closeList: () => {
        setListOpen(false);
        setDraftAt(null);
      },
    },
  };
}
