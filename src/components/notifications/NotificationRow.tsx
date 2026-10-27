import {
  Heart,
  Repeat2,
  Quote,
  MessageCircle,
  AtSign,
  UserRoundPlus,
} from "lucide-react";
import { Link } from "react-router";

import { APP_ROUTES } from "@/constants/routes";
import { APP_LOCALE } from "@/constants/app";

import { Avatar, Button, TwemojiText, VerifiedBadge } from "@/ui";

import { cn } from "@/utils/cn";
import { formatRelativeTime } from "@/utils/format";
import { normalizeInlineDisplayText } from "@/utils/displayText";

import type { ChirpNotification, NotificationType } from "@/types/notification";

const eventIcons = {
  like: Heart,
  repost: Repeat2,
  quote: Quote,
  reply: MessageCircle,
  mention: AtSign,
  follow: UserRoundPlus,
};
const descriptions: Record<NotificationType, string> = {
  like: "- вподобання вашого",
  repost: "- репост вашого",
  quote: "- цитата вашого матеріалу",
  reply: "- відповідь вам",
  mention: "- згадка про вас",
  follow: "- нова підписка на вас",
};

export function NotificationRow({
  notification,
  onRead,
}: {
  notification: ChirpNotification;
  onRead: () => void;
}) {
  const item = notification;
  const actor = item.actors[0];
  const Icon = eventIcons[item.type];
  const href =
    item.type === "follow"
      ? actor
        ? APP_ROUTES.profile(actor.username)
        : null
      : item.target
        ? APP_ROUTES.post(item.target.id, item.target.type)
        : null;
  const name = actor
    ? normalizeInlineDisplayText(actor.displayName || `@${actor.username}`)
    : "Користувач";
  const description =
    item.type === "like" || item.type === "repost"
      ? `${descriptions[item.type]} ${item.target?.type === "comment" ? "коментаря" : "поста"}`
      : descriptions[item.type];

  const content = (
    <>
      <p className="wrap-anywhere text-sm leading-5 sm:text-[15px]">
        <span className="font-semibold text-foreground">
          <TwemojiText text={name} />
        </span>
        {actor && (
          <VerifiedBadge
            user={actor}
            className="ml-1 inline-block size-4 align-middle"
          />
        )}
        {item.actorCount > 1 && (
          <span className="text-muted-foreground">
            {" "}
            та ще {item.actorCount - 1}
          </span>
        )}
        <span className="text-muted-foreground"> {description}</span>
      </p>
      {item.target?.preview && (
        <p className="mt-1.5 line-clamp-2 wrap-anywhere whitespace-pre-wrap border-l-2 border-border pl-3 text-sm leading-5 text-muted-foreground">
          <TwemojiText text={item.target.preview} />
        </p>
      )}
      {!href && (
        <p className="mt-1 text-sm text-muted-foreground">
          Матеріал більше недоступний.
        </p>
      )}
    </>
  );

  return (
    <article
      aria-label={
        item.isRead ? "Прочитане сповіщення" : "Непрочитане сповіщення"
      }
      className={cn(
        "flex gap-3 border-b border-border px-4 py-3 transition-colors sm:gap-4",
        item.isRead ? "hover:bg-muted/50" : "bg-primary/5 hover:bg-primary/10",
      )}
    >
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary",
          item.type === "like" && "bg-pink-500/10 text-pink-500",
          item.type === "repost" && "bg-emerald-500/10 text-emerald-500",
        )}
      >
        <Icon
          className={cn("size-5", item.type === "like" && "fill-current")}
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex min-h-7 items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {item.actors.slice(0, 3).map((user) => (
              <Link
                key={user.id}
                to={APP_ROUTES.profile(user.username)}
                onClick={onRead}
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Профіль @${user.username}`}
              >
                <Avatar
                  userId={user.id}
                  src={user.avatarUrl}
                  name={user.displayName}
                  fallbackName={user.username}
                  className="size-7"
                />
              </Link>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            {!item.isRead && (
              <span className="size-2 rounded-full bg-primary">
                <span className="sr-only">Непрочитане</span>
              </span>
            )}
            <time
              dateTime={item.updatedAt}
              title={new Date(item.updatedAt).toLocaleString(APP_LOCALE)}
            >
              {formatRelativeTime(item.updatedAt)}
            </time>
          </div>
        </div>
        {href ? (
          <Link
            to={href}
            onClick={onRead}
            className="block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {content}
          </Link>
        ) : (
          <div>
            {content}
            {!item.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRead}
                className="mt-2"
              >
                Позначити прочитаним
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
