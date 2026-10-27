import { mapUserRole, type BackendUser } from "@/api/mappers/user.mapper";

import type { ChirpNotification } from "@/types/notification";
import type { UserShort } from "@/types/user";

export type BackendNotification = Omit<ChirpNotification, "actors"> & {
  actors: BackendUser<UserShort>[];
};

export function mapNotification(notification: BackendNotification): ChirpNotification {
  return { ...notification, actors: notification.actors.map(mapUserRole) };
}
