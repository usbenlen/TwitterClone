import { cn } from "@/shared/lib/cn";

interface PostComposerDropOverlayProps {
  visible: boolean;
  title?: string;
  description?: string;
  className?: string;
}

export default function ComposerDropOverlay({
  visible,
  className,
  title = "Перетягніть файли сюди",
  description = "JPEG, PNG, WEBP, MP4 або WEBM",
}: PostComposerDropOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-content flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm",
        className,
      )}
    >
      <div className="rounded-2xl bg-background px-6 py-5 text-center shadow-lg">
        <p className="text-lg font-semibold text-primary">{title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
