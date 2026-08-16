import { forwardRef } from "react";

type EmojiTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const EmojiTextarea = forwardRef<HTMLTextAreaElement, EmojiTextareaProps>(
  function EmojiTextarea({ className = "", ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        className={`w-full resize-none bg-transparent outline-none ${className}`}
      />
    );
  },
);

EmojiTextarea.displayName = "EmojiTextarea";

export default EmojiTextarea;
