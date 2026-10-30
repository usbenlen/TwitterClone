import type { ChirpNotification } from "@/features/notifications/types/notification";
import type { BackendUser, UserShort } from "@/features/profiles/types";

export type BackendNotification = Omit<ChirpNotification, "actors"> & {
  actors: BackendUser<UserShort>[];
};
