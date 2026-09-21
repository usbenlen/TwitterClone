import { API_BASE_URL, ENDPOINTS } from "@/api/config";
import { MOCK_ENABLED } from "@/mock/config";
import { cn } from "@/utils/cn";

interface GoogleAuthButtonProps {
  className?: string;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.93A6.03 6.03 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.63.39 3.17 1.04 4.55l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}

export function GoogleAuthButton({ className }: GoogleAuthButtonProps) {
  const content = (
    <>
      <GoogleIcon />
      Увійти за допомогою Google
    </>
  );

  const buttonClassName = cn(
    "cursor-pointer inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-6 text-base font-bold text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
    className,
  );

  if (MOCK_ENABLED) {
    return (
      <button
        type="button"
        disabled
        title="MOCK режим - неможна"
        className={buttonClassName}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={`${API_BASE_URL}${ENDPOINTS.auth.google}`}
      className={buttonClassName}
    >
      {content}
    </a>
  );
}
