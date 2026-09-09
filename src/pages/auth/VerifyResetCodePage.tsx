import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/schemas/auth.schema";

import { authApi } from "@/api/auth.api";
import { ApiError } from "@/api/client";

import { useAuth } from "@/hooks";

import { Button, Input } from "@/ui";

import { AuthShell, CodeInput } from "@/components/auth";

import { APP_ROUTES } from "@/constants/routes";

const verifyResetCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Код має містити 6 цифр")
    .regex(/^\d+$/, "Код має містити лише цифри"),
});

type VerifyResetCodeFormValues = z.infer<typeof verifyResetCodeSchema>;

interface LocationState {
  email?: string;
  currentPassword?: string;
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

  const [currentPasswordVal, setCurrentPasswordVal] =
    useState<ChangePasswordFormValues["currentPassword"]>("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<VerifyResetCodeFormValues>({
    resolver: zodResolver(verifyResetCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const {
    register: registerPasswordChange,
    handleSubmit: handleSubmitPasswordChange,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
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

  if (!email && !isSettings) return null;

  const handleSendCode = async (values: ChangePasswordFormValues) => {
    setServerError(null);
    setInfoMessage(null);

    try {
      const response = await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setCurrentPasswordVal(values.currentPassword);
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
        const response = await authApi.changePassword({
          currentPassword: currentPasswordVal,
          code,
        });

        setInfoMessage(response.message || "Пароль успішно змінено.");
        setTimeout(() => {
          navigate(APP_ROUTES.SETTINGS, { replace: true });
        }, 1500);
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
  const emailDestination = email || "вашу email адресу";
  const subtitle = isSettings
    ? !codeSent
      ? `Введіть ваш поточний пароль, щоб отримати код підтвердження на ${emailDestination}`
      : `Введіть 6-значний код, який ми надіслали на ${emailDestination}`
    : `Введіть 6-значний код, який ми надіслали на ${emailDestination}`;

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
          onSubmit={handleSubmitPasswordChange(handleSendCode)}
          className="space-y-4"
          noValidate
        >
          <Input
            label="Поточний пароль"
            type="password"
            autoComplete="current-password"
            placeholder="Введіть поточний пароль"
            error={passwordErrors.currentPassword?.message}
            {...registerPasswordChange("currentPassword")}
          />
          <Input
            label="Новий пароль"
            type="password"
            autoComplete="new-password"
            placeholder="Введіть новий пароль"
            error={passwordErrors.newPassword?.message}
            {...registerPasswordChange("newPassword")}
          />
          <Input
            label="Підтвердження нового пароля"
            type="password"
            autoComplete="new-password"
            placeholder="Повторіть новий пароль"
            error={passwordErrors.confirmPassword?.message}
            {...registerPasswordChange("confirmPassword")}
          />
          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isPasswordSubmitting}
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
            disabled={code.length !== 6}
          >
            Підтвердити код
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
