import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authApi } from "@/api/auth.api";
import { ApiError } from "@/api/client";

import { useAuth } from "@/hooks";

import { Button } from "@/ui";

import { AuthShell, CodeInput } from "@/components/auth";

import { APP_ROUTES } from "@/constants/routes";

const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(6, "Код має містити 6 цифр")
    .regex(/^\d+$/, "Код має містити лише цифри"),
});

type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

interface LocationState {
  email?: string;
}

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail } = useAuth();

  const email = (location.state as LocationState)?.email;

  const [code, setCode] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    if (!email) navigate(APP_ROUTES.REGISTER, { replace: true });
  }, [email, navigate]);

  if (!email) return null;

  const handleResendCode = async () => {
    setServerError(null);
    setInfoMessage(null);
    setResending(true);

    try {
      const response = await authApi.resendVerificationCode({ email });
      setInfoMessage(response.message || "Новий код надіслано на ваш email.");
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Не вдалося надіслати новий код. Спробуйте ще раз.",
      );
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async () => {
    setServerError(null);
    setInfoMessage(null);

    try {
      await verifyEmail({
        email,
        code,
      });

      navigate(APP_ROUTES.HOME, { replace: true });
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Не вдалося підтвердити пошту. Спробуйте ще раз.",
      );
    }
  };

  const footer = (
    <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
      <span>
        Не отримали код?{" "}
        <button
          type="button"
          onClick={handleResendCode}
          disabled={resending}
          className="font-semibold text-primary hover:underline cursor-pointer bg-transparent border-0 disabled:opacity-50"
        >
          {resending ? "Надсилання..." : "Надіслати знову"}
        </button>
      </span>
      <span>
        Повернутися до{" "}
        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.REGISTER)}
          className="font-semibold text-primary hover:underline cursor-pointer bg-transparent border-0"
        >
          Реєстрації
        </button>
      </span>
    </div>
  );

  return (
    <AuthShell
      title="Підтвердження пошти"
      subtitle={`Ми надіслали 6-значний код підтвердження на ${email}. Будь ласка, введіть його нижче.`}
      footer={footer}
    >
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
          Підтвердити пошту
        </Button>
      </form>
    </AuthShell>
  );
}
