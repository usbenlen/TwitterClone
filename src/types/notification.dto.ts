import type { BackendUser } from "@/types/user.dto";

import type { ChirpNotification } from "@/types/notification";

import type { UserShort } from "@/types/user";

export type BackendNotification = Omit<ChirpNotification, "actors"> & {
  actors: BackendUser<UserShort>[];
};
