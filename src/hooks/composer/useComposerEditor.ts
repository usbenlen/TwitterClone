import { useRef } from "react";

import { countCharacters } from "@/utils/composer/composerRules";

export function useComposerEditor() {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (
    value: string,
    text: string,
    setValue: (value: string) => void,
    target?: { editor: HTMLInputElement; maxLength: number },
  ) => {
    const editor = target?.editor ?? editorRef.current;

    if (!editor) {
      setValue(text + value);
      return;
    }

    const start = editor.selectionStart ?? text.length;
    const end = editor.selectionEnd ?? start;

    const next = text.slice(0, start) + value + text.slice(end);
    if (target && countCharacters(next) > target.maxLength) return;

    setValue(next);

    requestAnimationFrame(() => {
      if (!editor.isConnected) return;
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
