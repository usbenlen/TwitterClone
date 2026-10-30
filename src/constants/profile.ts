import { numericEnv } from "@/constants/app";

import type { BirthDateVisibility, ProfileTab } from "@/types";

export const MAX_NAME_LENGTH = numericEnv.VITE_MAX_NAME_LENGTH;

export const MAX_BIO_LENGTH = numericEnv.VITE_MAX_BIO_LENGTH;

export const BIRTH_DATE_MIN_YEAR = 1900;
export const DEFAULT_BIRTH_DATE_VISIBILITY: BirthDateVisibility = "only_me";
export const BIRTH_DATE_VISIBILITY_OPTIONS = [
  { value: "public", label: "Загальнодоступно" },
  { value: "followers", label: "Ваші підписники" },
  { value: "following", label: "Люди, яких ви читаєте" },
  { value: "mutual", label: "Ви читаєте одне одного" },
  { value: "only_me", label: "Лише ви" },
] as const satisfies ReadonlyArray<{
  value: BirthDateVisibility;
  label: string;
}>;

export const PROFILE_TABS = [
  { id: "posts", label: "Твіти" },
  { id: "replies", label: "Відповіді" },
  { id: "likes", label: "Лайки" },
  { id: "reposts", label: "Репости" },
] as const satisfies ReadonlyArray<{ id: ProfileTab; label: string }>;

export const VERIFIED_BADGE_COLOR = "#1d9bf0";
export const ADMIN_BADGE_COLOR = "#8899a6";
