import { useEffect, useState } from "react";

export function useDebouncedValue<T>(
  value: T,
  delay: number,
  initialValue: T = value,
): T {
  const [debounced, setDebounced] = useState(initialValue);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
