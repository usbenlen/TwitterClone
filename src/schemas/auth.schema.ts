/** @format */

import { z } from "zod";

import { AUTH_LIMITS, MAX_NAME_LENGTH } from "@/constants/app";

/*
 * Схеми валідації форм. Повідомлення українською.
 * Типи виводяться автоматом через z.infer - не треба повторювати руками.
 */

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Введіть email або username"),
  password: z.string().min(1, "Введіть пароль"),
});

export const registerSchema = z.object({
  displayName: z
    .string()
    .min(1, "Введіть ім'я")
    .max(MAX_NAME_LENGTH, `Максимум ${MAX_NAME_LENGTH} символів`),

  username: z
    .string()
    .min(
      AUTH_LIMITS.USERNAME_MIN_LENGTH,
      `Мінімум ${AUTH_LIMITS.USERNAME_MIN_LENGTH} символи`,
    )
    .max(
      AUTH_LIMITS.USERNAME_MAX_LENGTH,
      `Максимум ${AUTH_LIMITS.USERNAME_MAX_LENGTH} символів`,
    )
    .regex(/^[a-zA-Z0-9_]+$/, "Лише літери, цифри та _"),

  email: z.string().min(1, "Введіть email").email("Некоректний email"),

  password: z
    .string()
    .min(
      AUTH_LIMITS.PASSWORD_MIN_LENGTH,
      `Мінімум ${AUTH_LIMITS.PASSWORD_MIN_LENGTH} символів`,
    )
    .max(
      AUTH_LIMITS.PASSWORD_MAX_LENGTH,
      `Максимум ${AUTH_LIMITS.PASSWORD_MAX_LENGTH} символів`,
    ),
});

export const changePasswordBaseSchema = z.object({
  currentPassword: z.string().min(1, "Введіть поточний пароль"),
  newPassword: z
    .string()
    .min(AUTH_LIMITS.PASSWORD_MIN_LENGTH, `Мінімум ${AUTH_LIMITS.PASSWORD_MIN_LENGTH} символів`)
    .max(AUTH_LIMITS.PASSWORD_MAX_LENGTH, `Максимум ${AUTH_LIMITS.PASSWORD_MAX_LENGTH} символів`),
  confirmPassword: z.string().min(1, "Підтвердіть новий пароль"),
  code: z.string().optional(),
});

export const changePasswordSchema = changePasswordBaseSchema
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
