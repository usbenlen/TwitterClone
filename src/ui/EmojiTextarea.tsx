import { forwardRef } from "react";

type EmojiTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const EmojiTextarea = forwardRef<HTMLTextAreaElement, EmojiTextareaProps>(
  function EmojiTextarea({ className = "", ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        className={`w-full resize-none overflow-y-auto bg-transparent outline-none ${className}`}
      />
    );
  },
);

EmojiTextarea.displayName = "EmojiTextarea";

export default EmojiTextarea;
