import { mapUserRole } from "@/features/profiles/api/mappers/profileMapper";

import type {
  BackendNotification,
  ChirpNotification,
} from "@/features/notifications/types";

export function mapNotification(notification: BackendNotification): ChirpNotification {
  return { ...notification, actors: notification.actors.map(mapUserRole) };
}
