import { useEffect, useRef, useState } from "react";

import { linkPreviewApi } from "@/api/linkPreview.api";
import { ENABLE_LINK_PREVIEWS } from "@/constants/app";
import { findFirstHttpUrl } from "@/utils/linkPreview";

import type { LinkPreview } from "@/types/linkPreview";

const RESOLVE_DELAY_MS = 450;

export function useComposerLinkPreview(
  content: string,
  initialPreview: LinkPreview | null = null,
) {
  const [preview, setPreview] = useState<LinkPreview | null>(initialPreview);
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);
  const [errorUrl, setErrorUrl] = useState<string | null>(null);
  const [dismissedUrl, setDismissedUrl] = useState<string | null>(null);
  const requestId = useRef(0);

  const url = ENABLE_LINK_PREVIEWS ? findFirstHttpUrl(content) : null;

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    const controller = new AbortController();

    if (!url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(null);
      setLoadingUrl(null);
      setErrorUrl(null);
      setDismissedUrl(null);
      return () => controller.abort();
    }

    if (preview?.url === url || dismissedUrl === url || errorUrl === url) {
      return () => controller.abort();
    }

    setPreview(null);
    setLoadingUrl(url);

    const timer = window.setTimeout(async () => {
      try {
        const result = await linkPreviewApi.resolve(url, controller.signal);
        if (requestId.current !== currentRequestId) return;

        setPreview(result);
        setErrorUrl(null);
      } catch {
        if (controller.signal.aborted || requestId.current !== currentRequestId)
          return;

        setPreview(null);
        setErrorUrl(url);
      } finally {
        if (requestId.current === currentRequestId) setLoadingUrl(null);
      }
    }, RESOLVE_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [dismissedUrl, errorUrl, preview?.url, url]);

  const remove = () => {
    if (url) setDismissedUrl(url);
    setPreview(null);
    setLoadingUrl(null);
  };

  const clear = () => {
    setPreview(null);
    setLoadingUrl(null);
    setErrorUrl(null);
    setDismissedUrl(null);
  };

  return {
    preview,
    loading: Boolean(url) && loadingUrl === url,
    remove,
    clear,
  };
}
