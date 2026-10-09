import { AUTH_LIMITS, APP_ROUTES } from "@/constants";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  changePasswordSchema,
  type ChangePasswordFormValues,
  verificationCodeSchema,
  type VerificationCodeFormValues,
} from "@/schemas/auth.schema";

import { authApi } from "@/api/auth.api";
import { ApiError } from "@/api/client";

import { useAuth } from "@/hooks";

import { Button, Input } from "@/ui";

import { AuthShell, CodeInput } from "@/components/auth/index";

interface LocationState {
  email?: string;
}

interface VerifyResetCodePageProps {
  variant?: "auth" | "settings";
}

export default function VerifyResetCodePage({
  variant = "auth",
}: VerifyResetCodePageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isSettings = variant === "settings";
  const email = isSettings
    ? user?.email
    : (location.state as LocationState)?.email;

  const [codeSent, setCodeSent] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [code, setCode] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<VerificationCodeFormValues>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const {
    register: registerCurrent,
    handleSubmit: handleSubmitCurrent,
    formState: { errors: currentErrors, isSubmitting: isCurrentSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isSettings && !email)
      navigate(APP_ROUTES.FORGOT_PASSWORD, { replace: true });
  }, [email, navigate, isSettings]);

  useEffect(() => {
    if (!passwordChanged) return;
    const timer = window.setTimeout(
      () => navigate(APP_ROUTES.SETTINGS, { replace: true }),
      1500,
    );
    return () => window.clearTimeout(timer);
  }, [navigate, passwordChanged]);

  if (!email && !isSettings) return null;

  const handleSendCode = async (values: ChangePasswordFormValues) => {
    setServerError(null);
    setInfoMessage(null);

    try {
      const response = await authApi.startPasswordChange({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setCodeSent(true);
      setInfoMessage(
        response.message || "Код підтвердження надіслано на email.",
      );
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Не вдалося надіслати код. Спробуйте ще раз.",
      );
    }
  };

  const onSubmit = async () => {
    setServerError(null);

    if (isSettings) {
      try {
        const response = await authApi.confirmPasswordChange({ code });
        setInfoMessage(response.message || "Пароль успішно змінено.");
        setPasswordChanged(true);
      } catch (error) {
        setServerError(
          error instanceof ApiError
            ? error.message
            : "Не вдалося змінити пароль. Спробуйте ще раз.",
        );
      }
    } else {
      try {
        await authApi.verifyResetCode({
          email: email!,
          code,
        });

        navigate(APP_ROUTES.RESET_PASSWORD, {
          state: { email, code },
        });
      } catch (error) {
        setServerError(
          error instanceof ApiError
            ? error.message
            : "Не вдалося перевірити код. Спробуйте ще раз.",
        );
      }
    }
  };

  const title = isSettings ? "Зміна пароля" : "Підтвердження коду";
  const subtitle = isSettings
    ? !codeSent
      ? "Введіть поточний і новий пароль, щоб отримати код підтвердження"
      : `Введіть ${AUTH_LIMITS.VERIFICATION_CODE_LENGTH}-значний код, який ми надіслали на ${email}`
    : `Введіть ${AUTH_LIMITS.VERIFICATION_CODE_LENGTH}-значний код, який ми надіслали на ${email}`;

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
        <p className="mb-5 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </p>
      )}

      {infoMessage && (
        <p className="mb-5 rounded-md bg-green-500/10 p-3 text-sm text-green-600">
          {infoMessage}
        </p>
      )}

      {isSettings && !codeSent ? (
        <form
          onSubmit={handleSubmitCurrent(handleSendCode)}
          className="space-y-4"
          noValidate
        >
          <Input
            label="Поточний пароль"
            type="password"
            autoComplete="current-password"
            placeholder="Введіть поточний пароль"
            error={currentErrors.currentPassword?.message}
            {...registerCurrent("currentPassword")}
          />
          <Input
            label="Новий пароль"
            type="password"
            autoComplete="new-password"
            placeholder="Введіть новий пароль"
            error={currentErrors.newPassword?.message}
            {...registerCurrent("newPassword")}
          />
          <Input
            label="Підтвердження нового пароля"
            type="password"
            autoComplete="new-password"
            placeholder="Повторіть новий пароль"
            error={currentErrors.confirmPassword?.message}
            {...registerCurrent("confirmPassword")}
          />
          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isCurrentSubmitting}
          >
            Надіслати код підтвердження
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <CodeInput
            value={code}
            onChange={(value) => {
              setCode(value);
              setValue("code", value, {
                shouldValidate: true,
              });
            }}
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            disabled={
              passwordChanged ||
              code.length !== AUTH_LIMITS.VERIFICATION_CODE_LENGTH
            }
          >
            Підтвердити код
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
