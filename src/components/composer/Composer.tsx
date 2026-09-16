import { useState } from "react";
import { CalendarClock, X } from "lucide-react";

import { useAuth, useTweetComposer, useDragAndDrop } from "@/hooks";

import { Avatar, Button } from "@/ui";

import {
  ComposerToolbar,
  ComposerPopovers,
  ScheduleModal,
  ScheduledPostsModal,
} from "@/components/composer";

import {
  TweetComposerEditor,
  TweetComposerMediaPreview,
  TweetComposerFooter,
  TweetComposerDropOverlay,
  TweetComposerErrors,
  TweetComposerFileInputs,
  TweetComposerPollPreview,
  TweetComposerLocationPreview,
  TweetComposerLinkPreview,
} from "@/components/tweet/TweetComposer";

import { cn } from "@/utils/cn";
import { QuotedTweetCard } from "@/components/tweet/quote";

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

  const drag = useDragAndDrop({
    onFilesSelected: composer.onFilesSelected,
  });

  if (!user) return null;

  const isComment = variant === "comment";

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
            placeholder={placeholder}
            rows={2}
            className="max-h-160 text-lg"
          />

          <TweetComposerMediaPreview
            media={composer.media}
            onRemove={composer.removeMedia}
          />

          {composer.pollPreview.visible && (
            <TweetComposerPollPreview
              poll={composer.pollPreview.poll}
              onRemove={composer.pollPreview.onRemove}
            />
          )}

          {composer.locationPreview.visible &&
            composer.locationPreview.location && (
              <TweetComposerLocationPreview
                location={composer.locationPreview.location}
                onRemove={composer.locationPreview.onRemove}
              />
            )}

          {composer.linkPreview.visible && (
            <TweetComposerLinkPreview
              preview={composer.linkPreview.preview}
              loading={composer.linkPreview.loading}
              onRemove={composer.linkPreview.onRemove}
            />
          )}

          {quotedTweet && <QuotedTweetCard quote={quotedTweet} />}

          {composer.scheduling.scheduledAt && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <CalendarClock size={17} />
                {new Intl.DateTimeFormat("uk-UA", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(composer.scheduling.scheduledAt))}
              </span>
              {composer.scheduling.canClear && (
                <button
                  type="button"
                  onClick={composer.scheduling.clear}
                  className="flex size-7 items-center justify-center rounded-full hover:bg-muted"
                  aria-label="Прибрати запланований час"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          <TweetComposerErrors errors={composer.errors} />

          <div className="flex shrink-0 items-center justify-between pt-3">
            <ComposerToolbar
              onAction={composer.handleAction}
              buttonRefs={composer.buttonRefs}
              disabledActions={composer.disabledActions}
              hiddenActions={composer.scheduling.enabled ? [] : ["schedule"]}
            />

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

          <ComposerPopovers
            emoji={composer.popovers.emoji}
            gif={composer.popovers.gif}
            poll={composer.popovers.poll}
            location={composer.popovers.location}
          />

          <TweetComposerFileInputs
            imageRef={composer.imageInputRef}
            videoRef={composer.videoInputRef}
            onFilesSelected={composer.onFilesSelected}
          />

          {composer.scheduling.open && (
            <ScheduleModal
              key={composer.scheduling.modalInitialAt ?? "new-schedule"}
              open
              initialAt={composer.scheduling.modalInitialAt}
              onClose={() => composer.scheduling.onOpenChange(false)}
              onApply={composer.scheduling.apply}
              onClear={
                composer.scheduling.canClear && composer.scheduling.scheduledAt
                  ? composer.scheduling.clear
                  : undefined
              }
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
            <span className="text-primary">@{replyingToUsername}</span>
          </p>
        )}

        <div className="flex items-center gap-3">
          <TweetComposerEditor
            value={composer.content}
            onChange={composer.setContent}
            editorRef={composer.editorRef}
            placeholder={placeholder}
            onFocus={() => setIsExpanded(true)}
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
            <TweetComposerMediaPreview
              media={composer.media}
              onRemove={composer.removeMedia}
            />

            {composer.pollPreview.visible && (
              <TweetComposerPollPreview
                poll={composer.pollPreview.poll}
                onRemove={composer.pollPreview.onRemove}
              />
            )}

            {composer.locationPreview.visible &&
              composer.locationPreview.location && (
                <TweetComposerLocationPreview
                  location={composer.locationPreview.location}
                  onRemove={composer.locationPreview.onRemove}
                />
              )}

            {composer.linkPreview.visible && (
              <TweetComposerLinkPreview
                preview={composer.linkPreview.preview}
                loading={composer.linkPreview.loading}
                onRemove={composer.linkPreview.onRemove}
              />
            )}

            {quotedTweet && <QuotedTweetCard quote={quotedTweet} />}

            <TweetComposerErrors errors={composer.errors} />

            {/* Toolbar + Reply */}
            <div className="flex shrink-0 items-center justify-between pt-3">
              <ComposerToolbar
                onAction={composer.handleAction}
                buttonRefs={composer.buttonRefs}
                disabledActions={composer.disabledActions}
                hiddenActions={["schedule"]}
              />

              <TweetComposerFooter
                remaining={composer.remaining}
                canSubmit={composer.canSubmit}
                isPosting={composer.isPosting}
                onSubmit={handleSubmit}
                submitLabel={submitLabel}
                disabled={!composer.content.trim() || composer.isPosting}
              />
            </div>

            <ComposerPopovers
              emoji={composer.popovers.emoji}
              gif={composer.popovers.gif}
              poll={composer.popovers.poll}
              location={composer.popovers.location}
            />

            <TweetComposerFileInputs
              imageRef={composer.imageInputRef}
              videoRef={composer.videoInputRef}
              onFilesSelected={composer.onFilesSelected}
            />
          </div>
        )}
      </div>
    </div>
  );
}
