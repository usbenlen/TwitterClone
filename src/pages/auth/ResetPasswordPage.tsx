import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";

import { authApi } from "@/api/auth.api";
import { ApiError } from "@/api/client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { type ChangePasswordFormValues } from "@/schemas/auth.schema";

import { Input, Button } from "@/ui";

import { AuthShell } from "@/components/auth/AuthShell";

import { APP_ROUTES } from "@/constants/routes";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Мінімум 6 символів")
      .max(100, "Максимум 100 символів"),

    confirmPassword: z.string().min(1, "Підтвердіть пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface LocationState {
  email?: string;
  code?: string;
  currentPassword?: string;
}

interface ResetPasswordPageProps {
  variant?: "auth" | "settings";
}

export default function ResetPasswordPage({
  variant = "auth",
}: ResetPasswordPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isSettings = variant === "settings";
  const { email, code, currentPassword } =
    (location.state as LocationState) ?? {};

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  if (isSettings) {
    if (!email || !code || !currentPassword) {
      navigate(APP_ROUTES.SETTINGS, { replace: true });
      return null;
    }
  } else {
    if (!email || !code) {
      navigate(APP_ROUTES.FORGOT_PASSWORD, { replace: true });
      return null;
    }
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);

    try {
      if (isSettings) {
        const payload: ChangePasswordFormValues = {
          currentPassword: currentPassword!,
          code: code!,
          newPassword: values.password,
          confirmPassword: values.confirmPassword,
        };
        const response = await authApi.changePassword(payload);
        setSuccessMessage(response.message || "Пароль успішно змінено.");
        setTimeout(() => {
          navigate(APP_ROUTES.SETTINGS, { replace: true });
        }, 2000);
      } else {
        await authApi.resetPassword({
          email: email!,
          code: code!,
          newPassword: values.password,
        });

        navigate(APP_ROUTES.LOGIN, {
          replace: true,
        });
      }
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Не вдалося змінити пароль. Спробуйте ще раз.",
      );
    }
  };

  const title = isSettings ? "Новий пароль" : "Новий пароль";
  const subtitle = isSettings
    ? "Введіть новий пароль для вашого акаунта, щоб завершити зміну."
    : "Введіть новий пароль для вашого акаунта.";

  const footer = isSettings ? (
    <button
      type="button"
      onClick={() => navigate(APP_ROUTES.SETTINGS)}
      className="font-semibold text-primary hover:underline cursor-pointer bg-transparent border-0"
    >
      Назад до налаштувань
    </button>
  ) : (
    <>
      <span>Згадали пароль?</span>{" "}
      <button
        type="button"
        onClick={() => navigate(APP_ROUTES.LOGIN)}
        className="font-semibold text-primary hover:underline cursor-pointer bg-transparent border-0"
      >
        Увійти
      </button>
    </>
  );

  return (
    <AuthShell title={title} subtitle={subtitle} footer={footer}>
      {serverError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </p>
      )}

      {successMessage && (
        <p className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
          {successMessage}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Новий пароль"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
          disabled={isSubmitting || !!successMessage}
        />

        <Input
          label="Підтвердження пароля"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
          disabled={isSubmitting || !!successMessage}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          disabled={!!successMessage}
        >
          Змінити пароль
        </Button>
      </form>
    </AuthShell>
  );
}
