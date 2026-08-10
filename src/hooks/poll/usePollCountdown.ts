/** @format */

import { useEffect, useMemo, useState } from "react";

function formatRemaining(ms: number) {
  const minutes = Math.floor(ms / 1000 / 60);
  if (minutes < 60) return `${minutes} хв`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} год`;

  const days = Math.floor(hours / 24);
  return `${days} дн`;
}

export function usePollCountdown(expiresAt: string) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60_000);

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
