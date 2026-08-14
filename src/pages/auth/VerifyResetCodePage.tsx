/** @format */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router";

import { authApi } from "@/api/auth.api";
import { ApiError } from "@/api/client";
import { AuthShell, CodeInput } from "@/components/auth";
import { Button, Input } from "@/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks";
import { changePasswordBaseSchema, type ChangePasswordFormValues } from "@/schemas/auth.schema";

import { z } from "zod";

const verifyResetCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Код має містити 6 цифр")
    .regex(/^\d+$/, "Код має містити лише цифри"),
});

type VerifyResetCodeFormValues = z.infer<typeof verifyResetCodeSchema>;

const currentPasswordSchema = changePasswordBaseSchema.pick({ currentPassword: true });
type CurrentPasswordFormValues = Pick<ChangePasswordFormValues, "currentPassword">;

interface LocationState {
  email?: string;
  currentPassword?: string;
}

interface VerifyResetCodePageProps {
  variant?: "auth" | "settings";
}

export default function VerifyResetCodePage({ variant = "auth" }: VerifyResetCodePageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isSettings = variant === "settings";
  const email = isSettings ? user?.email : (location.state as LocationState)?.email;

  const [currentPasswordVal, setCurrentPasswordVal] = useState<ChangePasswordFormValues["currentPassword"]>("");
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
    register: registerCurrent,
    handleSubmit: handleSubmitCurrent,
    formState: { errors: currentErrors, isSubmitting: isCurrentSubmitting },
  } = useForm<CurrentPasswordFormValues>({
    resolver: zodResolver(currentPasswordSchema),
    defaultValues: {
      currentPassword: "",
    },
  });

  useEffect(() => {
    if (!isSettings && !email) {
      navigate(APP_ROUTES.FORGOT_PASSWORD, { replace: true });
    }
  }, [email, navigate, isSettings]);

  if (!email && !isSettings) return null;

  const handleSendCode = async (values: CurrentPasswordFormValues) => {
    setServerError(null);
    setInfoMessage(null);

    try {
      const response = await authApi.changePassword({
        currentPassword: values.currentPassword,
      });
      setCurrentPasswordVal(values.currentPassword);
      setCodeSent(true);
      setInfoMessage(response.message || "Код підтвердження надіслано на email.");
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
      // In settings, we pass currentPassword and code to the next step
      navigate(APP_ROUTES.SETTINGS_CHANGE_PASSWORD + "/reset", {
        state: { email, currentPassword: currentPasswordVal, code },
      });
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
      ? "Введіть ваш поточний пароль, щоб отримати код підтвердження на email"
      : `Введіть 6-значний код, який ми надіслали на ${email}`
    : `Введіть 6-значний код, який ми надіслали на ${email}`;

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
        <form onSubmit={handleSubmitCurrent(handleSendCode)} className="space-y-4" noValidate>
          <Input
            label="Поточний пароль"
            type="password"
            autoComplete="current-password"
            placeholder="Введіть поточний пароль"
            error={currentErrors.currentPassword?.message}
            {...registerCurrent("currentPassword")}
          />
          <Button type="submit" size="lg" fullWidth isLoading={isCurrentSubmitting}>
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
