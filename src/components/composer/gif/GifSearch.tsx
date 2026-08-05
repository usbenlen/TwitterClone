/** @format */

interface GifSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function GifSearch({ value, onChange }: GifSearchProps) {
  return (
    <div className="border-b border-border p-3">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Пошук GIF..."
        className="w-full rounded-full bg-muted px-4 py-2 text-sm outline-none"
      />
    </div>
  );
}
