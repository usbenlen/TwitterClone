import { AVATAR_GRADIENTS, AVATAR_INITIALS_LIMIT } from "@/constants/avatar";

export function getAvatarGradient(seed: string): string {
  let hash = 2166136261;
  for (const char of seed) hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619);

  const [direction, start, end] = AVATAR_GRADIENTS[(hash >>> 0) % AVATAR_GRADIENTS.length];
  return `linear-gradient(${direction}, color-mix(in oklab, var(--muted), var(--foreground) ${start}%), color-mix(in oklab, var(--muted), var(--foreground) ${end}%))`;
}

export function getAvatarInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, AVATAR_INITIALS_LIMIT)
    .map((part) => Array.from(part)[0])
    .join("")
    .toUpperCase();
}
