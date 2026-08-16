import { Search, X } from "lucide-react";

import { cn } from "@/utils/cn";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBox({
  value,
  onChange,
  onSubmit,
  placeholder = "Пошук",
  className,
}: SearchBoxProps) {
  const hasQuery = value.trim().length > 0;

  const clearSearch = () => {
    onChange("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-10 items-center gap-2 rounded-full",
          "bg-muted px-4",
          "transition-colors focus-within:ring-2 focus-within:ring-ring",
        )}
      >
        <Search size={18} className="shrink-0 text-muted-foreground" />

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm leading-none outline-none placeholder:text-muted-foreground"
        />

        {hasQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Очистити пошук"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </form>
  );
}
