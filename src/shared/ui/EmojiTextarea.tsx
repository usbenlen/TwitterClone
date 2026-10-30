import { forwardRef } from "react";

import { cn } from "@/shared/lib/cn";

type EmojiTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const EmojiTextarea = forwardRef<HTMLTextAreaElement, EmojiTextareaProps>(
  function EmojiTextarea({ className = "", ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        className={cn(
          "w-full resize-none overflow-y-auto bg-transparent outline-none",
          "dark:placeholder:text-muted-foreground",
          className,
        )}
      />
    );
  },
);

EmojiTextarea.displayName = "EmojiTextarea";

export default EmojiTextarea;
