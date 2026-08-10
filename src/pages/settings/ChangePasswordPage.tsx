/** @format */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { z } from "zod";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Lock,
  MailCheck,
} from "lucide-react";

import { authApi } from "@/api/auth.api";
import { ApiError } from "@/api/client";
import { CodeInput } from "@/components/auth";
import { APP_ROUTES } from "@/constants/routes";
import { Button, Input } from "@/ui";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Введіть поточний пароль"),
    newPassword: z
      .string()
      .min(6, "Мінімум 6 символів")
      .max(100, "Максимум 100 символів"),
    confirmPassword: z.string().min(1, "Підтвердіть новий пароль"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

type Step = "request" | "confirm" | "success";

interface PendingChange {
  currentPassword: string;
  newPassword: string;
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("request");
  const [serverError, setServerError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(
    null,
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const requestCode = async (values: ChangePasswordFormValues) => {
    setServerError(null);
    setInfoMessage(null);

    try {
      const response = await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setPendingChange({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setInfoMessage(response.message);
      setConfirmationCode("");
      setStep("confirm");
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Не вдалося надіслати код підтвердження. Спробуйте ще раз.",
      );
    }
  };

  const confirmPasswordChange = async () => {
    if (!pendingChange || confirmationCode.length !== 6) return;

    setServerError(null);
    setInfoMessage(null);
    setIsConfirming(true);

    try {
      const response = await authApi.changePassword({
        currentPassword: pendingChange.currentPassword,
        code: confirmationCode,
      });

      setInfoMessage(response.message);
      setStep("success");
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Не вдалося підтвердити зміну пароля. Спробуйте ще раз.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const resendCode = async () => {
    const values = getValues();

    if (!values.currentPassword || !values.newPassword) return;

    setServerError(null);
    setInfoMessage(null);
    setIsResending(true);

    try {
      const response = await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setInfoMessage(response.message);
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Не вдалося повторно надіслати код. Спробуйте ще раз.",
      );
    } finally {
      setIsResending(false);
    }
  };

  const isRequestStep = step === "request";
  const isConfirmStep = step === "confirm";
  const isSuccessStep = step === "success";

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.SETTINGS)}
          className="mb-5 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
          Налаштування
        </button>

        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {isRequestStep && <KeyRound className="size-5" />}
            {isConfirmStep && <MailCheck className="size-5" />}
            {isSuccessStep && <CheckCircle2 className="size-5" />}
          </div>

          <div>
            <h1 className="text-2xl font-bold">Змінити пароль</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {isRequestStep &&
                "Введіть поточний і новий пароль. Код підтвердження прийде на email."}
              {isConfirmStep &&
                "Введіть 6-значний код з email, щоб завершити зміну пароля."}
              {isSuccessStep && "Пароль підтверджено і успішно змінено."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-background p-5 shadow-sm">
        {serverError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        {infoMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {isRequestStep && (
          <form
            onSubmit={handleSubmit(requestCode)}
            className="space-y-5"
            noValidate
          >
            <div className="space-y-4">
              <Input
                label="Поточний пароль"
                type="password"
                autoComplete="current-password"
                placeholder="Введіть поточний пароль"
                error={errors.currentPassword?.message}
                {...register("currentPassword")}
              />

              <Input
                label="Новий пароль"
                type="password"
                autoComplete="new-password"
                placeholder="Введіть новий пароль"
                error={errors.newPassword?.message}
                {...register("newPassword")}
              />

              <Input
                label="Підтвердіть новий пароль"
                type="password"
                autoComplete="new-password"
                placeholder="Повторіть новий пароль"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              <Lock className="mt-0.5 size-4 shrink-0" />
              <p>
                Після відправки ми надішлемо код підтвердження на email,
                прив&apos;язаний до акаунта.
              </p>
            </div>

            <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
              Надіслати код підтвердження
            </Button>
          </form>
        )}

        {isConfirmStep && pendingChange && (
          <div className="space-y-5">
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              Код підтвердження вже надіслано. Для завершення зміни пароля
              введіть 6 цифр з листа.
            </div>

            <CodeInput
              value={confirmationCode}
              onChange={(value) => {
                setConfirmationCode(value);
                setServerError(null);
              }}
              disabled={isConfirming}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                size="lg"
                fullWidth
                isLoading={isConfirming}
                disabled={confirmationCode.length !== 6}
                onClick={confirmPasswordChange}
              >
                Підтвердити зміну
              </Button>

              <Button
                type="button"
                size="lg"
                fullWidth
                variant="outline"
                isLoading={isResending}
                onClick={resendCode}
              >
                Надіслати код ще раз
              </Button>
            </div>
          </div>
        )}

        {isSuccessStep && (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              Зміна пароля завершена. Новий пароль уже активний для вашого
              акаунта.
            </div>

            <Button
              type="button"
              size="lg"
              fullWidth
              onClick={() => navigate(APP_ROUTES.SETTINGS, { replace: true })}
            >
              Повернутися в налаштування
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
