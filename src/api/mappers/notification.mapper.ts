import { mapUserRole } from "@/api/mappers/user.mapper";

import type { ChirpNotification, NotificationType } from "@/types/notification";
import type {
  BackendNotification,
  BackendNotificationType,
} from "@/types/notification.dto";

const notificationTypes: Record<BackendNotificationType, NotificationType> = {
  Follow: "follow",
  PostLike: "like",
  CommentLike: "like",
  PostRepost: "repost",
  CommentRepost: "repost",
  PostComment: "reply",
  CommentReply: "reply",
  Quote: "quote",
};

export function mapNotification(
  notification: BackendNotification,
): ChirpNotification {
  const type = notificationTypes[notification.type];
  if (!type) throw new Error("Невідомий тип сповіщення.");

  let target: ChirpNotification["target"] = null;
  switch (notification.type) {
    case "PostLike":
    case "PostRepost":
      target = {
        type: "post",
        id: notification.postId ?? notification.sourceId,
        preview: null,
      };
      break;
    case "CommentLike":
    case "CommentRepost":
      target = {
        type: "comment",
        id: notification.commentId ?? notification.sourceId,
        preview: null,
      };
      break;
    case "PostComment":
    case "CommentReply":
      target = { type: "comment", id: notification.sourceId, preview: null };
      break;
    case "Quote":
      target = { type: "post", id: notification.sourceId, preview: null };
      break;
  }

  return {
    id: notification.id,
    type,
    actors: [mapUserRole(notification.actor)],
    actorCount: 1,
    target,
    createdAt: notification.createdAt,
    updatedAt: notification.createdAt,
    isRead: Boolean(notification.readAt),
    isMention: false,
  };
}
