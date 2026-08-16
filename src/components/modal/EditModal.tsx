import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Avatar, Button, EmojiTextarea } from "@/ui";
import EmojiPicker from "@/components/composer/emoji/EmojiPicker";
import { ComposerToolbar } from "@/components/composer";

interface EditModalProps {
  open: boolean;
  initialContent: string;
  title: string;
  onClose: () => void;
  onSave: (content: string) => Promise<void>;
}

export default function EditModal(props: EditModalProps) {
  const { open } = props;
  if (!open) return null;
  return (
    <EditModalInner
      key={open ? "edit-modal-open" : "edit-modal-closed"}
      {...props}
    />
  );
}

function EditModalInner({
  open,
  initialContent,
  title,
  onClose,
  onSave,
}: EditModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (showEmojiPicker) {
        setShowEmojiPicker(false);
        return;
      }
      if (!isSaving) onClose();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!showEmojiPicker) return;
      if (pickerRef.current && event.target instanceof Node && pickerRef.current.contains(event.target)) return;
      setShowEmojiPicker(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, showEmojiPicker, isSaving, onClose]);

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((previous) => previous + emoji);
      setShowEmojiPicker(false);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = content.slice(0, start) + emoji + content.slice(end);
    const nextCursor = start + emoji.length;
    setContent(nextValue);
    setShowEmojiPicker(false);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = content.trim();
    if (!text || isSaving || text === initialContent) return;
    setIsSaving(true);
    try {
      await onSave(text);
      onClose();
    } catch (error) {
      console.error("Failed to update content", error);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-0 sm:p-4 sm:pt-12">
      <div className="relative flex h-full w-full max-w-[600px] flex-col bg-background sm:h-auto sm:rounded-2xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
              aria-label="Закрити"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
        </div>
        <div className="px-4 py-3">
          <form onSubmit={handleSubmit} className="grid grid-cols-[48px_1fr] gap-3">
            <div className="flex justify-center">
              <Avatar name={user?.displayName} fallbackName={user?.username} src={user?.avatarUrl} className="size-11" />
            </div>
            <div className="relative flex min-w-0 flex-col justify-between">
              <EmojiTextarea
                ref={textareaRef}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Що відбувається?"
                className="py-2 text-[17px]"
                rows={4}
                autoFocus
                disabled={isSaving}
              />
              <div className="flex items-center justify-between border-t border-border pt-3">
                <ComposerToolbar
                  disabled={isSaving}
                  showEmojiPicker={showEmojiPicker}
                  onAction={(action) => {
                    if (action === "emoji") {
                      setShowEmojiPicker((prev) => !prev);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={!content.trim() || isSaving || content === initialContent}
                  isLoading={isSaving}
                  className="cursor-pointer rounded-full px-5 py-2 h-9 font-bold text-[15px]"
                >
                  Зберегти
                </Button>
              </div>
              {showEmojiPicker && (
                <div ref={pickerRef} className="absolute bottom-[52px] left-0 z-50 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
                  <EmojiPicker onSelect={handleEmojiSelect} />
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
