import { useEffect, useState } from "react";

import { linkPreviewApi } from "@/features/content/api";
import { LINK_PREVIEW_DEBOUNCE_MS } from "@/features/content/constants/composer";
import { findFirstHttpUrl } from "@/features/content/lib/composer/linkPreview";
import { ENABLE_LINK_PREVIEWS } from "@/shared/config/featureFlags";

import type { LinkPreview } from "@/features/content/types";

interface PreviewResolution {
  sourceUrl: string;
  preview: LinkPreview | null;
}

export function useComposerLinkPreview(
  content: string,
  initialPreview: LinkPreview | null = null,
) {
  const url = ENABLE_LINK_PREVIEWS ? findFirstHttpUrl(content) : null;
  const [resolution, setResolution] = useState<PreviewResolution | null>(() =>
    url && initialPreview ? { sourceUrl: url, preview: initialPreview } : null,
  );
  const isResolved = resolution !== null && resolution.sourceUrl === url;

  useEffect(() => {
    if (!url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResolution(null);
      return;
    }
    if (isResolved) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const result = await linkPreviewApi.resolve(url, controller.signal);
        if (!controller.signal.aborted) setResolution({ sourceUrl: url, preview: result });
      } catch {
        if (!controller.signal.aborted) setResolution({ sourceUrl: url, preview: null });
      }
    }, LINK_PREVIEW_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isResolved, url]);

  return {
    preview: isResolved ? resolution.preview : null,
    remove: () => setResolution(url ? { sourceUrl: url, preview: null } : null),
    clear: () => setResolution(null),
  };
}
