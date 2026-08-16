import { Button } from "@/ui";

interface TweetComposerFooterProps {
  remaining: number;
  canSubmit: boolean;
  isPosting: boolean;
  onSubmit: () => void;
}

export default function TweetComposerFooter({
  remaining,
  canSubmit,
  isPosting,
  onSubmit,
}: TweetComposerFooterProps) {
  return (
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

      <Button onClick={onSubmit} disabled={!canSubmit} isLoading={isPosting}>
        Опублікувати
      </Button>
    </div>
  );
}
