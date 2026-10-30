import type { BackendNotification, ChirpNotification } from "@/types";
import { mapUserRole } from "@/api/mappers/profileMapper";

export function mapNotification(notification: BackendNotification): ChirpNotification {
  return { ...notification, actors: notification.actors.map(mapUserRole) };
}
