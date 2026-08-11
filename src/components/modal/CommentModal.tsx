/** @format */

import { useState } from "react";
import { X, Image, Film, BarChart2, Smile, Calendar, MapPin } from "lucide-react";
import { Avatar, Button } from "@/ui";
import { useAuth } from "@/hooks/useAuth";
import type { Tweet } from "@/types/tweet";

interface CommentModalProps {
  open: boolean;
  tweet: Tweet;
  onClose: () => void;
  onSubmit: (content: string) => Promise<boolean>;
  isSubmitting: boolean;
}

export default function CommentModal({
  open,
  tweet,
  onClose,
  onSubmit,
  isSubmitting,
}: CommentModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    const success = await onSubmit(content.trim());
    if (success) {
      setContent("");
      onClose();
    }
  };

  const authorDisplayName = tweet.author.displayName || tweet.author.username;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-border bg-background p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-foreground transition-colors hover:bg-muted"
            aria-label="Закрити"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Drafts
          </button>
        </div>

        {/* Content of post replying to */}
        <div className="grid grid-cols-[48px_1fr] gap-3">
          <div className="flex flex-col items-center">
            <Avatar
              name={tweet.author.displayName}
              fallbackName={tweet.author.username}
              src={tweet.author.avatarUrl}
              className="size-11"
            />
            <div className="mt-2 w-0.5 flex-1 bg-border" style={{ minHeight: "24px" }} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[15px]">
              <span className="font-bold text-foreground truncate">{authorDisplayName}</span>
              <span className="text-muted-foreground truncate">@{tweet.author.username}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground text-sm">
                {new Date(tweet.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="mt-1 text-[15px] text-foreground leading-normal whitespace-pre-wrap wrap-break-word">
              {tweet.content}
            </p>

            <p className="mt-3 text-[15px] text-muted-foreground">
              Replying to <span className="text-primary hover:underline cursor-pointer">@{tweet.author.username}</span>
            </p>
          </div>
        </div>

        {/* Current user reply form */}
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-[48px_1fr] gap-3">
          <div className="flex justify-center">
            <Avatar
              name={user?.displayName}
              fallbackName={user?.username}
              src={user?.avatarUrl}
              className="size-11"
            />
          </div>

          <div className="min-w-0 flex flex-col justify-between">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post your reply"
              className="w-full resize-none border-0 bg-transparent py-2 text-[17px] text-foreground outline-none placeholder:text-muted-foreground"
              rows={3}
              autoFocus
            />

            {/* Toolbar & Reply Button */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-1 text-primary">
                <button type="button" className="rounded-full p-2 transition-colors hover:bg-primary/10">
                  <Image size={19} />
                </button>
                <button type="button" className="rounded-full p-2 transition-colors hover:bg-primary/10">
                  <Film size={19} />
                </button>
                <button type="button" className="rounded-full p-2 transition-colors hover:bg-primary/10">
                  <BarChart2 size={19} className="rotate-90" />
                </button>
                <button type="button" className="rounded-full p-2 transition-colors hover:bg-primary/10">
                  <Smile size={19} />
                </button>
                <button type="button" className="rounded-full p-2 transition-colors hover:bg-primary/10">
                  <Calendar size={19} />
                </button>
                <button type="button" className="rounded-full p-2 transition-colors hover:bg-primary/10 opacity-50 cursor-not-allowed" disabled>
                  <MapPin size={19} />
                </button>
              </div>

              <Button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                isLoading={isSubmitting}
                className="rounded-full px-5 py-2 font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                Reply
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
