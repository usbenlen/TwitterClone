import {
  MILLISECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
  HOURS_PER_DAY,
  POLL_COUNTDOWN_INTERVAL_MS,
} from "@/constants";

import { useEffect, useMemo, useState } from "react";

function formatRemaining(ms: number) {
  const minutes = Math.floor(ms / MILLISECONDS_PER_MINUTE);
  if (minutes < MINUTES_PER_HOUR) return `${minutes} хв`;

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  if (hours < HOURS_PER_DAY) return `${hours} год`;

  const days = Math.floor(hours / HOURS_PER_DAY);
  return `${days} дн`;
}

export function usePollCountdown(expiresAt: string) {
  // eslint-disable-next-line react-hooks/purity
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, POLL_COUNTDOWN_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const remaining = useMemo(() => {
    return new Date(expiresAt).getTime() - now;
  }, [expiresAt, now]);

  const expired = remaining <= 0;

  return {
    expired,
    text: expired ? "Опитування завершене" : formatRemaining(remaining),
  };
}
