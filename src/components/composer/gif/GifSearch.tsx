interface GifSearchProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function GifSearch({ value, onChange, disabled = false }: GifSearchProps) {
  return (
    <div className="border-b border-border p-3">
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Пошук GIF..."
        aria-label="Пошук GIF"
        className="w-full rounded-full bg-muted px-4 py-2 text-sm outline-none dark:inset-ring dark:inset-ring-control-border dark:placeholder:text-muted-foreground"
      />
    </div>
  );
}
