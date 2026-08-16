import { useRef, useCallback, useEffect } from "react";

interface UseClickOrDragOptions {
  threshold?: number;
  ignoreSelector?: string;
}

export function useClickOrDrag(
  action: (event: React.MouseEvent<HTMLElement>) => void,
  options: UseClickOrDragOptions = {},
) {
  const {
    threshold = 5,
    ignoreSelector = 'button, a, textarea, input, video, [data-tweet-interactive="true"]',
  } = options;

  const isDragging = useRef(false);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const actionRef = useRef(action);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    actionRef.current = action;
  });

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;

      const target = event.target as HTMLElement;
      if (ignoreSelector && target.closest(ignoreSelector)) return;

      // If there was a previous uncompleted drag cycle, clean it up first
      if (cleanupRef.current) cleanupRef.current();

      isDragging.current = false;
      isMouseDown.current = true;
      startX.current = event.clientX;
      startY.current = event.clientY;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!isMouseDown.current) return;
        const dx = moveEvent.clientX - startX.current;
        const dy = moveEvent.clientY - startY.current;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > threshold) isDragging.current = true;
      };

      const cleanup = () => {
        isMouseDown.current = false;
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerCancel);
        cleanupRef.current = null;
      };

      const handlePointerUp = () => {
        cleanup();
      };

      const handlePointerCancel = () => {
        cleanup();
      };

      cleanupRef.current = cleanup;

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerCancel);
    },
    [ignoreSelector, threshold],
  );

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      // Check if the click target is an interactive element
      const target = event.target as HTMLElement;
      if (ignoreSelector && target.closest(ignoreSelector)) return;

      // Check if dragging occurred
      if (isDragging.current) {
        event.preventDefault();
        event.stopPropagation();
        isDragging.current = false; // Reset dragging state
        return;
      }

      // Check if text is currently selected within the document
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) return;

      // Execute the actual click action
      actionRef.current(event);
    },
    [ignoreSelector],
  );

  return {
    onPointerDown,
    onClick,
  };
}
