import type { UserShort } from "@/features/profiles/types/user";
import type { BackendUser } from "@/features/profiles/types/user.dto";

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
