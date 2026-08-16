import { GifItem } from "@/components/composer/gif";

import type { Gif } from "@/types/gif";

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
