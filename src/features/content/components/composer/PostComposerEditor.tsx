import { useAutosizeTextarea } from "@/shared/hooks/useAutosizeTextarea";
import { cn } from "@/shared/lib/cn";
import EmojiTextarea from "@/shared/ui/EmojiTextarea";

import type { RefObject } from "react";

interface PostComposerEditorProps {
  value: string;
  onChange: (value: string) => void;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  placeholder?: string;
  onFocus?: () => void;
  rows?: number;
  className?: string;
}

export default function PostComposerEditor({
  value,
  onChange,
  editorRef,
  placeholder = "Що відбувається?",
  onFocus,
  rows = 3,
  className = "",
}: PostComposerEditorProps) {
  useAutosizeTextarea(editorRef, value, rows);

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
