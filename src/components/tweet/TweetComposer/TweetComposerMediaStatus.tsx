/** @format */

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { MEDIA_STATUS } from "@/constants/app";

import type { ComposerMediaStatus } from "@/types/composer";

interface TweetComposerMediaStatusProps {
  status: ComposerMediaStatus;
  progress: number;
}

export default function TweetComposerMediaStatus({
  status,
  progress,
}: TweetComposerMediaStatusProps) {
  const [showUploaded, setShowUploaded] = useState(false);

  useEffect(() => {
    if (status !== MEDIA_STATUS.UPLOADED) return;

    setShowUploaded(true);

    const timer = setTimeout(() => {
      setShowUploaded(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [status]);

  switch (status) {
    case MEDIA_STATUS.COMPRESSING:
      return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-xl bg-background/90 px-4 py-2 shadow">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Оптимізація…</span>
          </div>
        </div>
      );

    case MEDIA_STATUS.UPLOADING:
      return (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-black/70 p-3">
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-white">
            <Loader2 className="size-3 animate-spin" />
            <span>Uploading… {progress}%</span>
          </div>
        </div>
      );

    case MEDIA_STATUS.ERROR:
      return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-500/70 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-xl bg-background/90 px-4 py-2 shadow">
            <AlertCircle className="size-4 text-red-500" />
            <span className="text-sm font-medium">Помилка завантаження</span>
          </div>
        </div>
      );

    case MEDIA_STATUS.UPLOADED:
      if (!showUploaded) return null;

      return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-xl bg-background/90 px-4 py-2 shadow">
            <CheckCircle2 className="size-5 text-green-500" />

            <span className="text-sm font-medium">Завантажено</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}
