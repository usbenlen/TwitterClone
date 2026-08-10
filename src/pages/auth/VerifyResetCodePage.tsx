/** @format */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router";

import { authApi } from "@/api/auth.api";
import { ApiError } from "@/api/client";
import { AuthShell, CodeInput } from "@/components/auth";
import { Button } from "@/ui";
import { APP_ROUTES } from "@/constants/routes";

import { z } from "zod";

const verifyResetCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Код має містити 6 цифр")
    .regex(/^\d+$/, "Код має містити лише цифри"),
});

type VerifyResetCodeFormValues = z.infer<typeof verifyResetCodeSchema>;

interface LocationState {
  email?: string;
}

export default function VerifyResetCodePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state as LocationState)?.email;
  const [code, setCode] = useState("");

  const [serverError, setServerError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!email) navigate(APP_ROUTES.FORGOT_PASSWORD, { replace: true });
  }, [email, navigate]);

  if (!email) return null;

  const onSubmit = async () => {
    setServerError(null);

    try {
      await authApi.verifyResetCode({
        email,
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
  };

  return (
    <AuthShell
      title="Підтвердження коду"
      subtitle={`Введіть 6-значний код, який ми надіслали на ${email}`}
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
    </AuthShell>
  );
}
