import { useRef, useState } from "react";
import { CalendarClock, Pencil, X } from "lucide-react";

import { ComposerAttachments } from "@/components/composer/ComposerAttachments";
import { ComposerInputsAndPopovers } from "@/components/composer/ComposerInputsAndPopovers";

import { formatDateTime, cn } from "@/utils";
import { normalizeInlineDisplayText } from "@/utils/displayText";

import { useAuth, useTweetComposer, useDragAndDrop } from "@/hooks";

import { Avatar, Button } from "@/ui";

import ComposerToolbar from "@/components/composer/ComposerToolbar";
import ScheduleModal from "@/components/composer/schedule/ScheduleModal";
import ScheduledPostsModal from "@/components/composer/schedule/ScheduledPostsModal";
import {
  TweetComposerEditor,
  TweetComposerFooter,
  TweetComposerDropOverlay,
  TweetComposerErrors,
} from "@/components/tweet/TweetComposer";

import type { TweetQuote } from "@/types";

interface ComposerProps {
  composer: ReturnType<typeof useTweetComposer>;
  className?: string;
  placeholder?: string;
  submitLabel?: string;
  showAvatar?: boolean;
  onSuccess?: () => void;
  variant?: "default" | "comment";
  replyingToUsername?: string;
  quotedTweet?: TweetQuote | null;
}

export default function Composer({
  composer,
  className,
  placeholder = "Що відбувається?",
  submitLabel = "Post",
  showAvatar = true,
  onSuccess,
  variant = "default",
  replyingToUsername,
  quotedTweet,
}: ComposerProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const scheduleReturnFocus = useRef<HTMLElement>(null);

  const drag = useDragAndDrop({
    onFilesSelected: composer.onFilesSelected,
  });

  if (!user) return null;

  const isComment = variant === "comment";
  const { scheduledAt } = composer.scheduling;
  const publicationTime = scheduledAt ? formatDateTime(scheduledAt, "long") : null;

  const handleSubmit = async () => {
    try {
      const result = await composer.submit();

      if (!result) return;

      onSuccess?.();
    } catch (error) {
      console.error("Failed to submit composer:", error);
    }
  };

  // DEFAULT VARIANT
  if (!isComment) {
    return (
      <div
        onDragEnter={drag.onDragEnter}
        onDragOver={drag.onDragOver}
        onDragLeave={drag.onDragLeave}
        onDrop={drag.onDrop}
        className={cn(
          "relative flex gap-3",
          drag.isDragging && "bg-primary/5 ring-2 ring-primary ring-inset",
          className,
        )}
      >
        {showAvatar && (
          <Avatar
            userId={user.id}
            fallbackName={user.username}
            name={user.displayName}
            src={user.avatarUrl}
            className="size-11 shrink-0"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <TweetComposerDropOverlay visible={drag.isDragging} />

          <TweetComposerEditor
            value={composer.content}
            onChange={composer.setContent}
            editorRef={composer.editorRef}
            onFocus={composer.onEditorFocus}
            placeholder={placeholder}
            rows={2}
            className="max-h-160 text-lg"
          />

          <ComposerAttachments composer={composer} quotedTweet={quotedTweet} />

          {scheduledAt && (
            <div className="mt-2 flex items-center rounded-2xl border border-border bg-transparent">
              <button
                type="button"
                disabled={composer.disabledActions.includes("schedule")}
                onClick={(event) => {
                  scheduleReturnFocus.current = event.currentTarget;
                  composer.scheduling.onOpenChange(true);
                }}
                className="flex min-h-14 min-w-0 flex-1 items-center gap-1.5 rounded-xl px-2.5 py-2 text-left hover:bg-muted/40 focus-visible:focus-indicator disabled:opacity-50 sm:gap-2"
                aria-label={`Змінити час публікації, ${publicationTime}`}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-primary/20 text-primary">
                  <CalendarClock size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs leading-4 text-muted-foreground">
                    Час публікації
                  </span>
                  <time
                    dateTime={scheduledAt}
                    className="block text-[13px] leading-5 text-foreground sm:text-sm"
                  >
                    {publicationTime}
                  </time>
                </span>
                <Pencil
                  size={15}
                  className="shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </button>
              {composer.scheduling.canClear && (
                <>
                  <span className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={composer.scheduling.clear}
                    disabled={composer.isPosting}
                    className="mx-1 flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:focus-indicator disabled:opacity-50"
                    aria-label="Прибрати запланований час"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          )}

          <TweetComposerErrors errors={composer.errors} />

          <div className="flex min-w-0 items-center justify-between gap-2 pt-3">
            <div
              tabIndex={0}
              aria-label="Панель інструментів допису"
              className="min-w-0 max-w-[280px] flex-1 overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-none sm:overflow-visible"
            >
              <ComposerToolbar
                onAction={(action) => {
                  if (action === "schedule") {
                    scheduleReturnFocus.current = composer.buttonRefs.schedule?.current ?? null;
                  }
                  composer.handleAction(action);
                }}
                buttonRefs={composer.buttonRefs}
                disabledActions={composer.disabledActions}
                activeActions={composer.pollEditor.visible ? ["poll"] : []}
                hiddenActions={composer.scheduling.enabled ? [] : ["schedule"]}
                className="w-max shrink-0 flex-nowrap"
              />
            </div>
            <TweetComposerFooter
              remaining={composer.remaining}
              canSubmit={composer.canSubmit}
              isPosting={composer.isPosting}
              onSubmit={handleSubmit}
              submitLabel={
                composer.scheduling.scheduledAt
                  ? composer.scheduling.submitLabel
                  : submitLabel
              }
            />
          </div>

          <ComposerInputsAndPopovers composer={composer} />

          {composer.scheduling.open && (
            <ScheduleModal
              key={composer.scheduling.modalInitialAt ?? "new-schedule"}
              open
              initialAt={composer.scheduling.modalInitialAt}
              returnFocus={scheduleReturnFocus}
              onClose={() => composer.scheduling.onOpenChange(false)}
              onApply={composer.scheduling.apply}
              onOpenScheduledPosts={
                composer.scheduling.showScheduledPostsLink
                  ? composer.scheduling.openList
                  : undefined
              }
            />
          )}

          <ScheduledPostsModal
            open={composer.scheduling.listOpen}
            onBack={composer.scheduling.backToSchedule}
            onClose={composer.scheduling.closeList}
            onCreatePost={() => {
              composer.scheduling.closeList();
              composer.editorRef.current?.focus();
            }}
          />
        </div>
      </div>
    );
  }

  //COMMENT VARIANT
  return (
    <div
      onDragEnter={drag.onDragEnter}
      onDragOver={drag.onDragOver}
      onDragLeave={drag.onDragLeave}
      onDrop={drag.onDrop}
      className={cn(
        "relative flex gap-3",
        drag.isDragging && "bg-primary/5 ring-2 ring-primary ring-inset",
        className,
      )}
    >
      {showAvatar && (
        <Avatar
          userId={user.id}
          fallbackName={user.username}
          name={user.displayName}
          src={user.avatarUrl}
          className="size-10 shrink-0"
        />
      )}

      <div className="relative min-w-0 flex-1 flex-col">
        <TweetComposerDropOverlay visible={drag.isDragging} />

        {isExpanded && replyingToUsername && (
          <p className="mb-1 shrink-0 text-sm text-muted-foreground">
            Replying to{" "}
            <span className="inline-block max-w-full overflow-hidden align-bottom wrap-anywhere text-primary">
              @{normalizeInlineDisplayText(replyingToUsername)}
            </span>
          </p>
        )}

        <div className="flex items-center gap-3">
          <TweetComposerEditor
            value={composer.content}
            onChange={composer.setContent}
            editorRef={composer.editorRef}
            placeholder={placeholder}
            onFocus={() => {
              composer.onEditorFocus();
              setIsExpanded(true);
            }}
            rows={!isExpanded ? 1 : 2}
            className="max-h-160 min-h-12 py-1.5 text-lg"
          />

          {/* Compact state */}
          {!isExpanded && (
            <Button
              type="button"
              disabled
              className="h-9 shrink-0 rounded-full px-5 text-[15px] font-bold"
            >
              {submitLabel}
            </Button>
          )}
        </div>

        {/* Expanded state */}
        {isExpanded && (
          <div>
            <ComposerAttachments
              composer={composer}
              quotedTweet={quotedTweet}
            />

            <TweetComposerErrors errors={composer.errors} />

            {/* Toolbar + Reply */}
            <div className="flex min-w-0 items-center justify-between gap-2 pt-3">
              <div
                tabIndex={0}
                aria-label="Панель інструментів відповіді"
                className="min-w-0 max-w-[280px] flex-1 overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-none sm:overflow-visible"
              >
                <ComposerToolbar
                  onAction={composer.handleAction}
                  buttonRefs={composer.buttonRefs}
                  disabledActions={composer.disabledActions}
                  activeActions={composer.pollEditor.visible ? ["poll"] : []}
                  hiddenActions={["schedule"]}
                  className="w-max shrink-0 flex-nowrap"
                />
              </div>
              <TweetComposerFooter
                remaining={composer.remaining}
                canSubmit={composer.canSubmit}
                isPosting={composer.isPosting}
                onSubmit={handleSubmit}
                submitLabel={submitLabel}
              />
            </div>

            <ComposerInputsAndPopovers composer={composer} />
          </div>
        )}
      </div>
    </div>
  );
}
