/** @format */
import { z } from "zod";

/*
 * Схеми валідації форм. Повідомлення українською.
 * Типи виводяться автоматом через z.infer - не треба повторювати руками.
 */

export const loginSchema = z.object({
  email: z.string().min(1, "Введіть email").email("Некоректний email"),
  password: z.string().min(1, "Введіть пароль"),
});

export const registerSchema = z.object({
  displayName: z
    .string()
    .min(1, "Введіть ім'я")
    .max(50, "Максимум 50 символів"),
  username: z
    .string()
    .min(3, "Мінімум 3 символи")
    .max(20, "Максимум 20 символів")
    .regex(/^[a-zA-Z0-9_]+$/, "Лише літери, цифри та _"),
  email: z.string().min(1, "Введіть email").email("Некоректний email"),
  password: z
    .string()
    .min(6, "Мінімум 6 символів")
    .max(100, "Максимум 100 символів"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
