/** @format */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router";

import { z } from "zod";

import { authApi } from "@/api/auth.api";
import { ApiError } from "@/api/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input, Button } from "@/ui";
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
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { email, code } = (location.state as LocationState) ?? {};

  const [serverError, setServerError] = useState<string | null>(null);

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

  if (!email || !code) {
    navigate(APP_ROUTES.FORGOT_PASSWORD, { replace: true });
    return null;
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);

    try {
      await authApi.resetPassword(email, code, values.password);

      navigate(APP_ROUTES.LOGIN, {
        replace: true,
      });
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Не вдалося змінити пароль. Спробуйте ще раз.",
      );
    }
  };

  return (
    <AuthShell
      title="Новий пароль"
      subtitle="Введіть новий пароль для вашого акаунта."
      footer={
        <>
          <span>Згадали пароль?</span>{" "}
          <a
            href={APP_ROUTES.LOGIN}
            className="font-semibold text-primary hover:underline"
          >
            Увійти
          </a>
        </>
      }
    >
      {serverError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
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
        />

        <Input
          label="Підтвердження пароля"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Змінити пароль
        </Button>
      </form>
    </AuthShell>
  );
}
