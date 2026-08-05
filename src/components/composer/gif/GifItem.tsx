/** @format */

import type { Gif } from "@/types/gif";

interface GifItemProps {
  gif: Gif;
  onSelect: (gif: Gif) => void;
}

export default function GifItem({ gif, onSelect }: GifItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(gif)}
      className="
        overflow-hidden
        rounded-lg
        hover:opacity-90
      "
    >
      <img
        src={gif.previewUrl}
        alt={gif.title}
        className="h-auto w-full"
        loading="lazy"
      />
    </button>
  );
}
