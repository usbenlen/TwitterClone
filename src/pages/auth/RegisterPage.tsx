/** @format */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { registerSchema, type RegisterFormValues } from "@/models/auth.schema";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input, Button } from "@/ui";
import { ApiError } from "@/api/client";
import { APP_ROUTES } from "@/constants/routes";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: "", username: "", email: "", password: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser(values);
      navigate(APP_ROUTES.HOME, { replace: true });
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.message
          : "He вдалося зареєструватися. Спробуйте пізніше.",
      );
    }
  };

  return (
    <AuthShell
      title="Створити акаунт"
      subtitle="Приєднуйтесь до Chirp за кілька секунд."
      footer={
        <span>
          Вже маєте акаунт?{" "}
          <Link
            to={APP_ROUTES.LOGIN}
            className="font-semibold text-primary hover:underline"
          >
            Увійти
          </Link>
        </span>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {serverError && (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {serverError}
          </p>
        )}

        <Input
          label="Ім'я"
          type="text"
          autoComplete="name"
          placeholder="Ваше ім'я"
          error={errors.displayName?.message}
          {...register("displayName")}
        />
        <Input
          label="Нікнейм"
          type="text"
          autoComplete="username"
          placeholder="username"
          error={errors.username?.message}
          {...register("username")}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Пароль"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Зареєструватися
        </Button>
      </form>
    </AuthShell>
  );
}
