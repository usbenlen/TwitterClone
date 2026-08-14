/** @format */

import { useEffect, useState } from "react";
import { imageCache } from "@/utils/image-cache";

/**
 * Очищує кеш зображення за URL. Корисно при оновленні профілю.
 */
export async function invalidateImageCache(url: string | null | undefined) {
  if (!url) return;
  // Ми не можемо легко видалити з IndexedDB за objectURL, 
  // але ми можемо видалити за оригінальним URL.
  await imageCache.remove(url);
}

/**
 * Хук для кешування зображень.
 * Повертає URL, який вказує на локальну копію зображення (з IndexedDB).
 */
export function useImageCache(url?: string | null) {
  const [cachedUrl, setCachedUrl] = useState<string | null>(() => {
    if (!url || url.startsWith("blob:") || url.startsWith("data:")) {
      return url ?? null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!url || url.startsWith("blob:") || url.startsWith("data:")) {
      // Якщо URL вже відповідає стану, нічого не робимо (запобігає циклу)
      setCachedUrl((prev) => (prev === (url ?? null) ? prev : (url ?? null)));
      return;
    }

    let isMounted = true;

    async function load() {
      setIsLoading(true);
      const result = await imageCache.fetchAndCache(url!);
      if (isMounted) {
        setCachedUrl(result);
        setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
      // Примітка: Ми не робимо URL.revokeObjectURL тут, бо 
      // зображення може використовуватись в інших місцях.
      // IndexedDB wrapper повертає нові objectURL, які будуть жити до перезавантаження.
    };
  }, [url]);

  return { src: cachedUrl, isLoading };
}
