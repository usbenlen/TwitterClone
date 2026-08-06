/** @format */

import { useAuth } from "@/hooks/useAuth";
import { useTweetComposer } from "@/hooks/composer";
import { useDragAndDrop } from "@/hooks/composer/media/useDragAndDrop";

import ComposerPopovers from "@/components/composer/ComposerPopovers";

import { Avatar } from "@/ui";

import type { Tweet } from "@/types/tweet";

import {
  TweetComposerEditor,
  TweetComposerToolbar,
  TweetComposerMediaPreview,
  TweetComposerFooter,
  TweetComposerDropOverlay,
  TweetComposerErrors,
  TweetComposerFileInputs,
  TweetComposerPollPreview,
  TweetComposerLocationPreview,
  TweetComposerEmbedPreview,
} from "@/components/tweet/TweetComposer";

import { cn } from "@/utils/cn";

interface TweetComposerProps {
  onCreated: (tweet: Tweet) => void;
}

export default function TweetComposer({ onCreated }: TweetComposerProps) {
  const { user } = useAuth();
  const composer = useTweetComposer({
    onCreated,
  });

  const drag = useDragAndDrop({
    onFilesSelected: composer.onFilesSelected,
  });

  if (!user) return null;

  return (
    <div
      onDragEnter={drag.onDragEnter}
      onDragOver={drag.onDragOver}
      onDragLeave={drag.onDragLeave}
      onDrop={drag.onDrop}
      className={cn(
        "relative flex gap-3 border-b border-border p-4 transition-all duration-200",
        drag.isDragging && "bg-primary/5 ring-2 ring-primary ring-inset",
      )}
    >
      <Avatar
        name={user.displayName}
        src={user.avatarUrl}
        className="size-11 shrink-0"
      />

      <div className="flex flex-1 flex-col gap-3">
        <TweetComposerDropOverlay visible={drag.isDragging} />

        <TweetComposerEditor
          value={composer.content}
          onChange={composer.setContent}
          editorRef={composer.editorRef}
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

        {composer.embedPreview.visible && composer.embedPreview.embed && (
          <TweetComposerEmbedPreview
            embed={composer.embedPreview.embed}
            onRemove={composer.embedPreview.onRemove}
          />
        )}

        <TweetComposerErrors errors={composer.errors} />

        <TweetComposerToolbar
          onAction={composer.handleAction}
          buttonRefs={composer.buttonRefs}
        />

        <ComposerPopovers
          emoji={composer.popovers.emoji}
          gif={composer.popovers.gif}
          poll={composer.popovers.poll}
          location={composer.popovers.location}
          embed={composer.popovers.embed}
        />

        <TweetComposerFileInputs
          imageRef={composer.imageInputRef}
          videoRef={composer.videoInputRef}
          onFilesSelected={composer.onFilesSelected}
        />

        <TweetComposerFooter
          remaining={composer.remaining}
          canSubmit={composer.canSubmit}
          isPosting={composer.isPosting}
          onSubmit={composer.submit}
        />
      </div>
    </div>
  );
}
