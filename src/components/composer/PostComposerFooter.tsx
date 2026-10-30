import { Button } from "@/components/ui/Button";

interface PostComposerFooterProps {
  remaining: number;
  canSubmit: boolean;
  isPosting: boolean;
  onSubmit: () => void;
  submitLabel?: string;
  disabled?: boolean;
}

export default function PostComposerFooter({
  remaining,
  canSubmit,
  isPosting,
  onSubmit,
  submitLabel = "Post",
  disabled,
}: PostComposerFooterProps) {
  return (
    <div className="ml-auto flex shrink-0 items-center justify-between gap-3">
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
        disabled={disabled || !canSubmit || isPosting}
        isLoading={isPosting}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
