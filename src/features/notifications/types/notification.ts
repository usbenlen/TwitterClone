import type { UserShort } from "@/features/profiles/types";
import type { CursorPage } from "@/shared/types";

export type NotificationType = "like" | "repost" | "quote" | "reply" | "mention" | "follow";
export type NotificationTab = "all" | "mentions";

export interface NotificationTarget {
  type: "post" | "comment";
  id: string;
  preview: string | null;
}

export interface ChirpNotification {
  id: string;
  type: NotificationType;
  actors: UserShort[];
  actorCount: number;
  target: NotificationTarget | null;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  isMention: boolean;
}

export interface NotificationsPage extends CursorPage<ChirpNotification> {
  readThrough: string;
}

export interface NotificationPreferences {
  likes: boolean;
  reposts: boolean;
  quotes: boolean;
  replies: boolean;
  mentions: boolean;
  follows: boolean;
}

export interface NotificationsApi {
  list(
    tab: NotificationTab,
    limit: number,
    cursor?: string | null,
  ): Promise<NotificationsPage>;
  unreadCount(): Promise<{ count: number }>;
  read(id: string, readThrough: string): Promise<void>;
  readAll(readThrough: string): Promise<void>;
  preferences(): Promise<NotificationPreferences>;
  updatePreferences(patch: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
}
