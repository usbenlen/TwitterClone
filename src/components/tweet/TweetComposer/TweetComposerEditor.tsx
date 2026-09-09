import { useEffect, type RefObject } from "react";

import { EmojiTextarea } from "@/ui";

import { cn } from "@/utils/cn";

interface TweetComposerEditorProps {
  value: string;
  onChange: (value: string) => void;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  placeholder?: string;
  onFocus?: () => void;
  rows?: number;
  className?: string;
}

export default function TweetComposerEditor({
  value,
  onChange,
  editorRef,
  placeholder = "Що відбувається?",
  onFocus,
  rows = 3,
  className = "",
}: TweetComposerEditorProps) {
  useEffect(() => {
    const textarea = editorRef.current;

    if (!textarea) return;

    const styles = window.getComputedStyle(textarea);

    const lineHeight = parseFloat(styles.lineHeight);
    const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

    const rowsHeight = lineHeight * rows + padding;
    const maxHeight = parseFloat(styles.maxHeight);

    const currentHeight = textarea.offsetHeight;

    textarea.style.transition = "none";
    textarea.style.height = "auto";

    const contentHeight = textarea.scrollHeight;

    const targetHeight = Math.min(
      Math.max(contentHeight, rowsHeight),
      Number.isFinite(maxHeight) ? maxHeight : Number.POSITIVE_INFINITY,
    );

    textarea.style.height = `${currentHeight}px`;

    requestAnimationFrame(() => {
      textarea.style.transition = "";

      textarea.style.height = `${targetHeight}px`;

      textarea.style.overflowY =
        contentHeight > targetHeight ? "auto" : "hidden";
    });
  }, [value, rows, editorRef]);

  return (
    <EmojiTextarea
      ref={editorRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={onFocus}
      className={cn(
        "w-full resize-none bg-transparent outline-none transition-[height] duration-400 ease-out",
        className,
      )}
    />
  );
}
