import { useEffect, useState } from "react";
import { imageCache, createObjectUrlOwner } from "@/utils";

export async function invalidateImageCache(url: string | null | undefined) {
  if (url) await imageCache.remove(url);
}

export function useImageCache(url?: string | null) {
  const original = url ?? null;
  const bypass = !original || original.startsWith("blob:") || original.startsWith("data:");
  const [loaded, setLoaded] = useState<{
    original: string;
    owner: ReturnType<typeof createObjectUrlOwner>;
    isActive: () => boolean;
  } | null>(null);

  useEffect(() => {
    if (bypass || !original) return;
    let active = true;
    const owner = createObjectUrlOwner();
    void imageCache.fetchAndCache(original).then((blob) => {
      if (!active) return;
      if (blob) owner.replace(blob);
      setLoaded({ original, owner, isActive: () => active });
    });
    return () => {
      active = false;
      owner.release();
    };
  }, [original, bypass]);

  const current = loaded?.original === original && loaded.isActive() ? loaded : null;
  return {
    src: bypass
      ? original
      : current
        ? (current.owner.current ?? original)
        : null,
    isLoading: !bypass && !current,
  };
}
