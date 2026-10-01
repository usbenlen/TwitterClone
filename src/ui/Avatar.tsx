import { AVATAR_DEFAULT_NAME } from "@/constants/avatar";
import { getAvatarGradient, getAvatarInitials, cn } from "@/utils";
import { useState } from "react";

import { useImageCache } from "@/hooks/useImageCache";

interface AvatarProps {
  userId?: string;
  src?: string | null;
  name?: string | null;
  fallbackName?: string;
  className?: string;
}

// Remount for each original URL so cached images and failures cannot leak
// into a newly uploaded photo or another user's avatar.
function AvatarImage({ src }: { src: string }) {
  const { src: cachedSrc } = useImageCache(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!cachedSrc || cachedSrc === failedSrc) return null;

  return (
    <img
      src={cachedSrc}
      alt=""
      className="absolute inset-0 size-full object-cover"
      onError={() => setFailedSrc(cachedSrc)}
    />
  );
}

/** Аватар користувача. Якщо немає картинки - показує ініціали. */
export function Avatar({
  userId,
  src,
  name,
  fallbackName,
  className,
}: AvatarProps) {
  const resolvedName = name?.trim() || fallbackName?.trim() || AVATAR_DEFAULT_NAME;

  const initials = getAvatarInitials(resolvedName);

  return (
    <div
      role="img"
      aria-label={resolvedName}
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-bold text-foreground [container-type:inline-size]",
        className,
      )}
      style={{
        backgroundImage: getAvatarGradient(
          userId?.trim() || fallbackName?.trim() || resolvedName,
        ),
      }}
    >
      <span
        aria-hidden="true"
        className="cursor-default text-[35cqi] leading-none select-none"
      >
        {initials}
      </span>
      {src && <AvatarImage key={src} src={src} />}
    </div>
  );
}
