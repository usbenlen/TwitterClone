/** @format */
import { cn } from "@/utils/cn";

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
}

// Аватар користувача. Якщо немає картинки покаже ініціали
export function Avatar({ src, name, className }: AvatarProps) {
  const initials = name
    .split(" ")
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
      {src ? (
        <img
          src={src || "/placeholder.svg"}
          alt={name}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}
