/** @format */

import type { RefObject } from "react";

import { EmojiTextarea } from "@/ui";

interface TweetComposerEditorProps {
  value: string;
  onChange: (value: string) => void;
  editorRef: RefObject<HTMLTextAreaElement | null>;
}

export default function TweetComposerEditor({
  value,
  onChange,
  editorRef,
}: TweetComposerEditorProps) {
  return (
      <EmojiTextarea
          ref={editorRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Що відбувається?"
          rows={3}
          className="text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
  );
}
