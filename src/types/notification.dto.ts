import type { BackendUser } from "@/api/mappers/user.mapper";
import type { UserShort } from "@/types/user";

export type BackendNotificationType =
  | "Follow"
  | "PostLike"
  | "CommentLike"
  | "PostRepost"
  | "CommentRepost"
  | "PostComment"
  | "CommentReply"
  | "Quote";

export interface BackendNotification {
  id: string;
  type: BackendNotificationType;
  actor: BackendUser<UserShort>;
  sourceId: string;
  postId?: string | null;
  commentId?: string | null;
  createdAt: string;
  readAt?: string | null;
}

export interface BackendUnreadNotificationCount {
  unreadCount: number;
}
