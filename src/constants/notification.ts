import type {
  NotificationPreferences,
  NotificationType,
} from "@/types/notification";

export const NOTIFICATIONS_PAGE_SIZE = 20;
export const NOTIFICATIONS_POLL_INTERVAL = 30_000;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  likes: true,
  reposts: true,
  quotes: true,
  replies: true,
  mentions: true,
  follows: true,
};

export const NOTIFICATION_PREFERENCE_KEYS: Record<
  NotificationType,
  keyof NotificationPreferences
> = {
  like: "likes",
  repost: "reposts",
  quote: "quotes",
  reply: "replies",
  mention: "mentions",
  follow: "follows",
};

export const NOTIFICATION_PREFERENCE_LABELS: Record<
  keyof NotificationPreferences,
  { title: string; description: string }
> = {
  likes: {
    title: "Вподобання",
    description: "Коли комусь подобається ваш пост або коментар.",
  },
  reposts: {
    title: "Репости",
    description: "Коли хтось поширює ваш пост або коментар.",
  },
  quotes: {
    title: "Цитати",
    description: "Коли хтось цитує ваш пост або коментар.",
  },
  replies: {
    title: "Відповіді",
    description: "Коли вам відповідають у дописах і обговореннях.",
  },
  mentions: {
    title: "Згадки",
    description: "Коли вас згадують у пості або коментарі.",
  },
  follows: {
    title: "Нові підписники",
    description: "Коли хтось починає стежити за вами.",
  },
};
