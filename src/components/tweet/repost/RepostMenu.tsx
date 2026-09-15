import { PenLine, Repeat2 } from "lucide-react";

import { ComposerPopover } from "@/components/composer";

interface RepostMenuProps {
  open: boolean;
  reference: HTMLElement | null;
  repostedByMe: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onRepost: () => void;
  onQuote: () => void;
}

export default function RepostMenu({
  open,
  reference,
  repostedByMe,
  pending,
  onOpenChange,
  onRepost,
  onQuote,
}: RepostMenuProps) {
  const select = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <ComposerPopover
      open={open}
      onOpenChange={onOpenChange}
      reference={reference}
    >
      <div className="min-w-44 py-2 text-sm font-semibold" role="menu">
        <button
          type="button"
          role="menuitem"
          disabled={pending}
          onClick={() => select(onRepost)}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Repeat2 className="size-5" aria-hidden="true" />
          {repostedByMe ? "Undo repost" : "Repost"}
        </button>

        <button
          type="button"
          role="menuitem"
          disabled={pending}
          onClick={() => select(onQuote)}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PenLine className="size-5" aria-hidden="true" />
          Quote
        </button>
      </div>
    </ComposerPopover>
  );
}
