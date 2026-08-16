import { useState } from "react";

import { embedApi } from "@/api/embed.api";

import type { Embed } from "@/types/embed";

import { useComposerPopup } from "@/hooks/composer";

export function useComposerEmbed() {
  const popup = useComposerPopup();
  const [url, setUrl] = useState("");
  const [embed, setEmbed] = useState<Embed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = async () => {
    if (!url.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const result = await embedApi.resolve(url);

      setEmbed(result);
    } catch {
      setError("Не вдалося отримати інформацію про відео.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setUrl("");
    setEmbed(null);
    setError(null);
  };

  return {
    ...popup,

    url,
    setUrl,

    embed,

    loading,
    error,

    resolve,

    clear,
  };
}
