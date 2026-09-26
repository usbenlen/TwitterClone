import {
  MoreHorizontal,
  Trash2,
  BadgeCheck,
  Flag,
} from "lucide-react";
import { Link } from "react-router";

import { APP_ROUTES } from "@/constants/routes";
import { formatRelativeTime } from "@/utils/format";

import type { Tweet } from "@/types/tweet";

import { useEffect, useRef, useState } from "react";

import ReportModal from "@/components/modal/ReportModal";

interface TweetHeaderProps {
  author: Tweet["author"];
  createdAt: string;
  isOwn: boolean;
  onReport: () => void;
}

export default function TweetHeader({
  author,
  createdAt,
  isOwn,
  onReport,
}: TweetHeaderProps) {
  const [open, setOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] =
      useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
          target instanceof Node &&
          menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener(
        "pointerdown",
        handlePointerDown,
    );

    return () => {
      document.removeEventListener(
          "pointerdown",
          handlePointerDown,
      );
    };
  }, [open]);

  return (
      <>
        <div
            ref={menuRef}
            className="relative flex min-w-0 items-center"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
            <Link
                to={APP_ROUTES.profile(author.username)}
                className="truncate font-bold text-foreground hover:underline"
            >
              {author.displayName}
            </Link>

            {author.isVerified && (
                <BadgeCheck
                    size={18}
                    className="shrink-0 text-background"
                    fill="#1d9bf0"
                />
            )}

            <span className="truncate text-muted-foreground">
            @{author.username}
          </span>

            <span className="text-muted-foreground">
            ·
          </span>

            <span className="shrink-0 text-muted-foreground">
            {formatRelativeTime(createdAt)}
          </span>
          </div>

          <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setOpen((current) => !current);
              }}
              className="ml-auto shrink-0 cursor-pointer rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Додаткові дії"
              aria-expanded={open}
          >
            <MoreHorizontal size={18} />
          </button>

          {open && (
              <div
                  className="absolute right-0 top-full z-40 mt-1 min-w-44 overflow-hidden rounded-xl border border-border bg-background py-1 shadow-xl"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
              >
                {isOwn ? (
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 size={18} />
                      Видалити
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          setIsReportModalOpen(true);
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Flag size={18} />
                      Подати скаргу
                    </button>
                )}
              </div>
          )}
        </div>

        <ReportModal
            open={isReportModalOpen}
            onClose={() => {
              setIsReportModalOpen(false);
            }}
            onSubmit={() => {
                onReport();
            }}
        />
      </>
  );
}