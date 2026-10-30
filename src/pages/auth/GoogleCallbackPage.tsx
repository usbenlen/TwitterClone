import { Link } from "react-router";

import { AuthShell } from "@/components/auth/AuthShell";

import { useGoogleCallback } from "@/hooks/auth/useGoogleCallback";

import { Button, Spinner } from "@/components/ui";

export default function GoogleCallbackPage() {
  const { isBusy, error, context, canRetry, retry, backTo } =
    useGoogleCallback();
  return (
    <AuthShell
      title={
        context?.mode === "link" ? "Прив’язка Google" : "Вхід через Google"
      }
      subtitle={
        isBusy ? "Завершуємо авторизацію…" : "Авторизацію не завершено."
      }
      footer={
        <Link
          to={backTo}
          replace
          className="font-semibold text-primary hover:underline"
        >
          {context?.mode === "link" ? "Повернутися" : "Повернутися до входу"}
        </Link>
      }
    >
      {isBusy ? (
        <div
          role="status"
          className="flex items-center gap-3 text-muted-foreground"
        >
          <Spinner variant="inline" />
          Зачекайте, будь ласка…
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {canRetry && (
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={retry}
              className="cursor-pointer"
            >
              Спробувати ще раз
            </Button>
          )}
        </div>
      )}
    </AuthShell>
  );
}
