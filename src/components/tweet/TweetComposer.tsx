/** @format */
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

import { Avatar, Button } from "@/ui";

import type { Tweet } from "@/types/tweet";
import { tweetApi } from "@/api/tweet.api";

const MAX_LENGTH = 280;

interface TweetComposerProps {
  onCreated: (tweet: Tweet) => void;
}

export default function TweetComposer({ onCreated }: TweetComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const remaining = MAX_LENGTH - content.length;
  const canPost = content.trim().length > 0 && remaining >= 0 && !isPosting;

  const handleSubmit = async () => {
    if (!canPost) return;
    setIsPosting(true);
    try {
      const tweet = await tweetApi.create(content.trim());
      onCreated(tweet);
      setContent("");
    } finally {
      setIsPosting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex gap-4 border-b border-border p-5">
      <Avatar
        name={user.displayName}
        src={user.avatarUrl}
        className="size-11 shrink-0"
      />
      <div className="flex flex-1 flex-col gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Що відбувається?"
          rows={3}
          className="w-full resize-none bg-transparent text-xl leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <span
            className={
              remaining < 0
                ? "text-sm font-medium text-destructive"
                : "text-sm text-muted-foreground"
            }
          >
            {remaining}
          </span>
          <Button
            onClick={handleSubmit}
            disabled={!canPost}
            isLoading={isPosting}
          >
            Опублікувати
          </Button>
        </div>
      </div>
    </div>
  );
}
