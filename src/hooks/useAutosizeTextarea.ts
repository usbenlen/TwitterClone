import { useEffect, type RefObject } from "react";

export function useAutosizeTextarea(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
  rows: number,
) {
  useEffect(() => {
    const textarea = ref.current;

    if (!textarea) return;

    const styles = window.getComputedStyle(textarea);

    const lineHeight = parseFloat(styles.lineHeight);
    const padding =
      parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

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

    const frame = requestAnimationFrame(() => {
      textarea.style.transition = "";

      textarea.style.height = `${targetHeight}px`;

      textarea.style.overflowY =
        contentHeight > targetHeight ? "auto" : "hidden";
    });
    return () => cancelAnimationFrame(frame);
  }, [value, rows, ref]);
}
