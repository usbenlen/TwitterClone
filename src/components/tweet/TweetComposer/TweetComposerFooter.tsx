import { Button } from "@/ui";

interface TweetComposerFooterProps {
  remaining: number;
  canSubmit: boolean;
  isPosting: boolean;
  onSubmit: () => void;
  submitLabel?: string;
  disabled?: boolean;
}

export default function TweetComposerFooter({
  remaining,
  canSubmit,
  isPosting,
  onSubmit,
  submitLabel = "Post",
  disabled,
}: TweetComposerFooterProps) {
  return (
    <div className="flex items-center justify-between gap-3">
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
        className="h-9 cursor-pointer rounded-full px-5 py-2 text-[15px] font-bold"
        onClick={onSubmit}
        disabled={disabled ?? !canSubmit}
        isLoading={isPosting}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
