/** @format */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router";
import { loginSchema, type LoginFormValues } from "@/models/auth.schema";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input, Button } from "@/ui";
import { ApiError } from "@/api/client";
import { APP_ROUTES } from "@/constants/routes";

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
      const from =
        (location.state as LocationState)?.from?.pathname ?? APP_ROUTES.HOME;
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.message
          : "He вдалося увійти. Спробуйте пізніше.",
      );
    }
  };

  return (
    <AuthShell
      title="Увійти в Chirp"
      subtitle="Раді знову бачити вас."
      footer={
        <span>
          Немає акаунта?{" "}
          <Link
            to={APP_ROUTES.REGISTER}
            className="font-semibold text-primary hover:underline"
          >
            Зареєструватися
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
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Увійти
        </Button>
      </form>
    </AuthShell>
  );
}
