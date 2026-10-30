import GifItem from "@/features/content/components/composer/gifs/GifItem";

import type { Gif } from "@/features/content/types";

interface GifGridProps {
  gifs: Gif[];
  onSelect: (gif: Gif) => void;
}

export default function GifGrid({ gifs, onSelect }: GifGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 p-3">
      {gifs.map((gif) => (
        <GifItem key={gif.id} gif={gif} onSelect={onSelect} />
      ))}
    </div>
  );
}
