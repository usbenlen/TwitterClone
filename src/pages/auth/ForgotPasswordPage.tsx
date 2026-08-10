/** @format */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";

import { AuthShell } from "@/components/auth/AuthShell";
import { Input, Button } from "@/ui";

import { ApiError } from "@/api/client";
import { authApi } from "@/api";
import { APP_ROUTES } from "@/constants/routes";

import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Введіть email").email("Некоректний email"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null);

    try {
      await authApi.forgotPassword({
        email: values.email,
      });

      navigate(APP_ROUTES.VERIFY_RESET_CODE, {
        state: { email: values.email },
      });
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.message
          : "Не вдалося надіслати код. Спробуйте пізніше.",
      );
    }
  };

  return (
    <AuthShell
      title="Відновлення пароля"
      subtitle="Введіть email, прив'язаний до вашого акаунта. Ми надішлемо вам 6-значний код."
      footer={
        <>
          Згадали пароль?{" "}
          <Link
            to={APP_ROUTES.LOGIN}
            className="font-semibold text-primary hover:underline"
          >
            Увійти
          </Link>
        </>
      }
    >
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Надіслати код
        </Button>
      </form>
    </AuthShell>
  );
}
