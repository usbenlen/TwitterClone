/** @format */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, KeyRound, Lock } from "lucide-react";

import { Button, Input } from "@/ui";
import { ApiError } from "@/api/client";
import { authApi } from "@/api/auth.api";
import { APP_ROUTES } from "@/constants/routes";

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

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setServerError(null);
    setSuccess(false);

    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setSuccess(true);
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Не вдалося змінити пароль. Спробуйте ще раз.",
      );
    }
  };

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.SETTINGS)}
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground font-semibold cursor-pointer"
        >
          <ArrowLeft className="size-5" />
          Налаштування
        </button>

        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Змінити пароль</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Оновіть пароль для захисту свого акаунта.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl border border-border bg-background p-5 shadow-sm"
      >
        {serverError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>Пароль успішно змінено.</span>
          </div>
        )}

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

          <p>Новий пароль повинен містити щонайменше 6 символів.</p>
        </div>

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Змінити пароль
        </Button>
      </form>
    </main>
  );
}
