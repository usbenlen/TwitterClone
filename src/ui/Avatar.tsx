import { useState } from "react";

import { useImageCache } from "@/hooks/useImageCache";

import { cn } from "@/utils/cn";

interface AvatarProps {
  userId?: string;
  src?: string | null;
  name?: string | null;
  fallbackName?: string;
  className?: string;
}

// Якщо скажуть що нейтральні градієнти занадто тусклі і треба щось яскравіше
// const gradients = [
//   "from-sky-400 to-blue-600",
//   "from-violet-400 to-fuchsia-600",
//   "from-pink-400 to-rose-600",
//   "from-teal-400 to-emerald-600",
//   "from-indigo-400 to-violet-600",
//   "from-orange-400 to-red-600",
//   "from-blue-400 to-indigo-600",
//   "from-cyan-400 to-blue-600",
// ] as const;

// Нейтральні градієнти
const gradients = [
  ["to bottom right", 5, 15],
  ["to bottom left", 5, 15],
  ["to top right", 5, 15],
  ["to top left", 5, 15],
  ["to bottom right", 8, 22],
  ["to bottom left", 8, 22],
  ["to top right", 8, 22],
  ["to top left", 8, 22],
] as const;

function gradientFor(seed: string) {
  let hash = 2166136261;
  for (const char of seed) {
    hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619);
  }
  const [direction, start, end] = gradients[(hash >>> 0) % gradients.length];
  return `linear-gradient(${direction}, color-mix(in oklab, var(--muted), var(--foreground) ${start}%), color-mix(in oklab, var(--muted), var(--foreground) ${end}%))`;
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
  const resolvedName = name?.trim() || fallbackName?.trim() || "User";

  const initials = resolvedName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join("")
    .toUpperCase();

  return (
    <div
      role="img"
      aria-label={resolvedName}
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-bold text-foreground [container-type:inline-size]",
        className,
      )}
      style={{
        backgroundImage: gradientFor(
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
