import { NOTIFICATIONS_POLL_INTERVAL } from "@/constants/notifications";

import { useAppSelector } from "@/store/hooks";

export function useNotificationPollingOptions() {
  const active = useAppSelector(
    (state) => state.api.config.focused && state.api.config.online,
  );
  return {
    // Explicitly cancel the timer when inactive: the current RTK Query poll
    // callback captures focus at scheduling time and can otherwise fire once more.
    pollingInterval: active ? NOTIFICATIONS_POLL_INTERVAL : 0,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  };
}
