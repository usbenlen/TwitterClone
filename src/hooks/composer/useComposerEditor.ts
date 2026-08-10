/** @format */

import { useRef } from "react";

export function useComposerEditor() {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (
    value: string,
    text: string,
    setValue: (value: string) => void,
  ) => {
    const editor = editorRef.current;

    if (!editor) {
      setValue(text + value);
      return;
    }

    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    const next = text.slice(0, start) + value + text.slice(end);

    setValue(next);

    requestAnimationFrame(() => {
      editor.focus();

      const cursor = start + value.length;

      editor.setSelectionRange(cursor, cursor);
    });
  };

  return {
    editorRef,
    insertAtCursor,
  };
}
