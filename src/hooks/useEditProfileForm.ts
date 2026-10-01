import { useState } from "react";
import type { UpdateProfileRequest } from "@/api/user.api";
import type { Location, User } from "@/types";
import { DEFAULT_BIRTH_DATE_VISIBILITY } from "@/constants/profile";
import {
  buildBirthDate,
  parseBirthDate,
  maxBirthDay,
  formatBirthMonthDay,
  getBirthYear,
} from "@/utils";

import { useLocationSearch, useUnsavedChangesGuard, invalidateImageCache, useImageSelection } from "@/hooks";

interface EditProfileFormOptions {
  user: User;
  onClose: () => void;
  onSave: (data: UpdateProfileRequest) => Promise<void>;
}

const INITIAL_UI = {
  isLocationOpen: false,
  isBirthDateEditing: false,
  isBirthDateConfirmOpen: false,
  isSaving: false,
  error: null as string | null,
};

function initialValues(user: User) {
  const birthDate = parseBirthDate(user.birthDate ?? null);
  return {
    displayName: user.displayName?.trim() || user.username,
    bio: user.bio ?? "",
    location: user.location ?? null,
    birthMonth: birthDate.month,
    birthDay: birthDate.day,
    birthYear: birthDate.year,
    birthDateVisibility: user.birthDateVisibility ?? DEFAULT_BIRTH_DATE_VISIBILITY,
    birthYearVisibility: user.birthYearVisibility ?? DEFAULT_BIRTH_DATE_VISIBILITY,
    removeLocation: false,
    removeBirthDate: false,
  };
}

export function useEditProfileForm({
  user,
  onClose,
  onSave,
}: EditProfileFormOptions) {
  const avatar = useImageSelection(user.avatarUrl);
  const banner = useImageSelection(user.bannerUrl);
  const [initial] = useState(() => initialValues(user));
  const [values, setValues] = useState(initial);
  const [ui, setUi] = useState(INITIAL_UI);
  const locationSearch = useLocationSearch();

  const updateValues = (patch: Partial<typeof values>) =>
    setValues((current) => ({ ...current, ...patch }));
  const updateUi = (patch: Partial<typeof ui>) =>
    setUi((current) => ({ ...current, ...patch }));

  const baseline = { ...initial, location: initial.location?.id };
  const comparable = {
    ...values,
    displayName: values.displayName.trim(),
    bio: values.bio.trim(),
    location: values.location?.id,
  };
  const hasChanges =
    avatar.file !== null ||
    banner.file !== null ||
    avatar.removed ||
    banner.removed ||
    Object.entries(comparable).some(
      ([key, value]) => value !== baseline[key as keyof typeof baseline],
    );
  const guard = useUnsavedChangesGuard({
    hasChanges,
    isBusy: ui.isSaving,
    onClose,
  });

  const handleDiscardChanges = () => {
    setValues(initial);
    setUi(INITIAL_UI);
    locationSearch.reset();
    avatar.reset();
    banner.reset();
    guard.confirmDiscard();
  };

  const toggleLocation = () => {
    if (ui.isLocationOpen) locationSearch.reset();
    setUi((current) => ({
      ...current,
      isLocationOpen: !current.isLocationOpen,
    }));
  };
  const handleLocationSelect = (location: Location) => {
    updateValues({ location, removeLocation: false });
    updateUi({ isLocationOpen: false });
    locationSearch.reset();
  };
  const handleRemoveLocation = () =>
    updateValues({ location: null, removeLocation: Boolean(user.location) });

  const updateBirthDate = (patch: Partial<typeof values>) => {
    updateValues(patch);
    updateUi({ error: null });
  };
  const handleBirthMonthChange = (birthMonth: string) => {
    const maxDay = maxBirthDay(values.birthYear, birthMonth);
    updateBirthDate({
      birthMonth,
      birthDay: Number(values.birthDay) > maxDay ? String(maxDay) : values.birthDay,
      removeBirthDate: false,
    });
  };
  const handleBirthYearChange = (birthYear: string) => {
    const today = new Date();
    const month = Number(values.birthMonth);
    const birthMonth =
      Number(birthYear) === today.getFullYear() && month > today.getMonth() + 1
        ? String(today.getMonth() + 1)
        : values.birthMonth;
    const maxDay = maxBirthDay(birthYear, birthMonth, today);
    updateBirthDate({
      birthYear,
      birthMonth,
      birthDay:
        Number(birthMonth) && Number(values.birthDay) > maxDay
          ? String(maxDay)
          : values.birthDay,
      removeBirthDate: false,
    });
  };
  const handleCancelBirthDateEditing = () => {
    updateBirthDate({
      birthMonth: initial.birthMonth,
      birthDay: initial.birthDay,
      birthYear: initial.birthYear,
      birthDateVisibility: initial.birthDateVisibility,
      birthYearVisibility: initial.birthYearVisibility,
      removeBirthDate: false,
    });
    updateUi({ isBirthDateEditing: false });
  };
  const handleRemoveBirthDate = () => {
    updateBirthDate({
      birthMonth: "",
      birthDay: "",
      birthYear: "",
      removeBirthDate: Boolean(user.birthDate),
    });
    updateUi({ isBirthDateEditing: false });
  };

  const currentBirthDate = values.removeBirthDate
    ? null
    : buildBirthDate(values.birthYear, values.birthMonth, values.birthDay);
  const currentBirthDateLabel = currentBirthDate
    ? `${formatBirthMonthDay(currentBirthDate)} ${getBirthYear(currentBirthDate)} р.`
    : null;

  const handleSave = async () => {
    if (
      !values.removeBirthDate &&
      (values.birthMonth || values.birthDay || values.birthYear) &&
      !currentBirthDate
    ) {
      updateUi({ error: "Оберіть коректні місяць, день і рік народження." });
      return;
    }
    updateUi({ error: null, isSaving: true });
    try {
      if (avatar.file || avatar.removed) await invalidateImageCache(user.avatarUrl);
      if (banner.file || banner.removed) await invalidateImageCache(user.bannerUrl);
      await onSave({
        displayName: values.displayName.trim() || user.username,
        bio: values.bio.trim(),
        location: values.removeLocation ? undefined : values.location,
        birthDate: currentBirthDate ?? undefined,
        birthDateVisibility: values.birthDateVisibility,
        birthYearVisibility: values.birthYearVisibility,
        removeLocation: values.removeLocation,
        removeBirthDate: values.removeBirthDate,
        removeAvatar: avatar.removed,
        removeBanner: banner.removed,
        avatar: avatar.file,
        banner: banner.file,
      });
      onClose();
    } catch (error) {
      updateUi({
        error: error instanceof Error ? error.message : "Не вдалося зберегти зміни.",
      });
    } finally {
      updateUi({ isSaving: false });
    }
  };

  return {
    values,
    ui,
    updateValues,
    updateUi,
    updateBirthDate,
    avatar,
    banner,
    locationSearch,
    guard,
    hasChanges,
    currentBirthDateLabel,
    handleDiscardChanges,
    toggleLocation,
    handleLocationSelect,
    handleRemoveLocation,
    handleBirthMonthChange,
    handleBirthYearChange,
    handleCancelBirthDateEditing,
    handleRemoveBirthDate,
    handleSave,
  };
}
