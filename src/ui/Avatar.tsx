/** @format */
import { useImageCache } from "@/hooks/useImageCache";
import { cn } from "@/utils/cn";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  fallbackName?: string;
  className?: string;
}

/** Аватар користувача. Якщо немає картинки — показує ініціали. */
export function Avatar({ src, name, fallbackName, className }: AvatarProps) {
  const { src: cachedSrc } = useImageCache(src);
  const resolvedName = name?.trim() || fallbackName?.trim() || "User";

  const initials = resolvedName
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-bold text-muted-foreground",
        className,
      )}
    >
      {cachedSrc ? (
        <img src={cachedSrc} alt={resolvedName} className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}
