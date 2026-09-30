import { useRef, useState } from "react";
import type { UpdateProfileRequest } from "@/api/user.api";
import type { BirthDateVisibility, Location, User } from "@/types";
import { DEFAULT_BIRTH_DATE_VISIBILITY } from "@/constants/profile";
import { buildBirthDate, parseBirthDate, maxBirthDay } from "@/utils/date";
import { formatBirthMonthDay, getBirthYear } from "@/utils/format";
import { useLocationSearch, useUnsavedChangesGuard, invalidateImageCache, useImageSelection } from "@/hooks";

interface EditProfileFormOptions {
  user: User;
  onClose: () => void;
  onSave: (data: UpdateProfileRequest) => Promise<void>;
}

export function useEditProfileForm({
  user,
  onClose,
  onSave,
}: EditProfileFormOptions) {
  const {
    file: avatar,
    preview: avatarPreview,
    removed: removeAvatar,
    onChange: handleAvatarChange,
    remove: handleRemoveAvatar,
    reset: resetAvatar,
  } = useImageSelection(user.avatarUrl);
  const {
    file: banner,
    preview: bannerPreview,
    removed: removeBanner,
    onChange: handleBannerChange,
    remove: handleRemoveBanner,
    reset: resetBanner,
  } = useImageSelection(user.bannerUrl);

  // це все обов'язково тоже якось скоротити
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const initialDisplayName = user.displayName?.trim() || user.username;
  const initialBio = user.bio ?? "";
  const initialLocation = user.location ?? null;
  const initialBirthDate = user.birthDate ?? null;
  const initialBirthDateParts = parseBirthDate(initialBirthDate);
  const initialBirthDateVisibility =
    user.birthDateVisibility ?? DEFAULT_BIRTH_DATE_VISIBILITY;
  const initialBirthYearVisibility =
    user.birthYearVisibility ?? DEFAULT_BIRTH_DATE_VISIBILITY;

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [location, setLocation] = useState<Location | null>(initialLocation);
  const [birthMonth, setBirthMonth] = useState(initialBirthDateParts.month);
  const [birthDay, setBirthDay] = useState(initialBirthDateParts.day);
  const [birthYear, setBirthYear] = useState(initialBirthDateParts.year);
  const [birthDateVisibility, setBirthDateVisibility] =
    useState<BirthDateVisibility>(initialBirthDateVisibility);
  const [birthYearVisibility, setBirthYearVisibility] =
    useState<BirthDateVisibility>(initialBirthYearVisibility);

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isBirthDateEditing, setIsBirthDateEditing] = useState(false);
  const [isBirthDateConfirmOpen, setIsBirthDateConfirmOpen] = useState(false);

  const [removeLocation, setRemoveLocation] = useState(false);
  const [removeBirthDate, setRemoveBirthDate] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locationSearch = useLocationSearch();

  const hasChanges =
    displayName.trim() !== initialDisplayName ||
    bio.trim() !== initialBio ||
    avatar !== null ||
    banner !== null ||
    removeLocation ||
    removeBirthDate ||
    removeAvatar ||
    removeBanner ||
    location?.id !== initialLocation?.id ||
    birthMonth !== initialBirthDateParts.month ||
    birthDay !== initialBirthDateParts.day ||
    birthYear !== initialBirthDateParts.year ||
    birthDateVisibility !== initialBirthDateVisibility ||
    birthYearVisibility !== initialBirthYearVisibility;

  const { isConfirmOpen, requestClose, cancelDiscard, confirmDiscard } =
    useUnsavedChangesGuard({
      hasChanges,
      isBusy: isSaving,
      onClose,
    });

  const handleDiscardChanges = () => {
    setIsLocationOpen(false);
    locationSearch.reset();

    setDisplayName(initialDisplayName);
    setBio(initialBio);
    setLocation(initialLocation);
    setBirthMonth(initialBirthDateParts.month);
    setBirthDay(initialBirthDateParts.day);
    setBirthYear(initialBirthDateParts.year);
    setBirthDateVisibility(initialBirthDateVisibility);
    setBirthYearVisibility(initialBirthYearVisibility);
    setIsBirthDateEditing(false);
    setIsBirthDateConfirmOpen(false);

    resetAvatar();
    resetBanner();

    setRemoveLocation(false);
    setRemoveBirthDate(false);

    setError(null);

    confirmDiscard();
  };

  const handleLocationSelect = (value: Location) => {
    setLocation(value);
    setRemoveLocation(false);

    setIsLocationOpen(false);
    locationSearch.reset();
  };

  const handleRemoveLocation = () => {
    setLocation(null);
    setRemoveLocation(Boolean(user.location));
  };

  const handleBirthMonthChange = (value: string) => {
    setBirthMonth(value);
    setRemoveBirthDate(false);
    setError(null);

    if (!birthDay) return;

    const maxDay = maxBirthDay(birthYear, value);

    if (Number(birthDay) > maxDay) setBirthDay(String(maxDay));
  };

  const handleBirthYearChange = (value: string) => {
    setBirthYear(value);
    setRemoveBirthDate(false);
    setError(null);

    const today = new Date();
    let selectedMonth = Number(birthMonth);

    if (
      Number(value) === today.getFullYear() &&
      selectedMonth > today.getMonth() + 1
    ) {
      selectedMonth = today.getMonth() + 1;
      setBirthMonth(String(selectedMonth));
    }

    if (!selectedMonth || !birthDay) return;

    const maxDay = maxBirthDay(value, String(selectedMonth), today);

    if (Number(birthDay) > maxDay) setBirthDay(String(maxDay));
  };

  const handleCancelBirthDateEditing = () => {
    setBirthMonth(initialBirthDateParts.month);
    setBirthDay(initialBirthDateParts.day);
    setBirthYear(initialBirthDateParts.year);
    setBirthDateVisibility(initialBirthDateVisibility);
    setBirthYearVisibility(initialBirthYearVisibility);
    setRemoveBirthDate(false);
    setIsBirthDateEditing(false);
    setError(null);
  };

  const handleRemoveBirthDate = () => {
    setBirthMonth("");
    setBirthDay("");
    setBirthYear("");
    setRemoveBirthDate(Boolean(initialBirthDate));
    setIsBirthDateEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    const hasAnyBirthDatePart = Boolean(birthMonth || birthDay || birthYear);
    const birthDate = buildBirthDate(birthYear, birthMonth, birthDay);

    if (!removeBirthDate && hasAnyBirthDatePart && !birthDate) {
      setError("Оберіть коректні місяць, день і рік народження.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      if (avatar || removeAvatar) await invalidateImageCache(user.avatarUrl);

      if (banner || removeBanner) await invalidateImageCache(user.bannerUrl);

      await onSave({
        displayName: displayName.trim() || user.username,
        bio: bio.trim() || undefined,

        location: removeLocation ? undefined : location,

        birthDate: removeBirthDate ? undefined : (birthDate ?? undefined),
        birthDateVisibility,
        birthYearVisibility,

        removeLocation,
        removeBirthDate,
        removeAvatar,
        removeBanner,

        avatar,
        banner,
      });

      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Не вдалося зберегти зміни.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const currentBirthDate = removeBirthDate
    ? null
    : buildBirthDate(birthYear, birthMonth, birthDay);
  const currentBirthDateLabel = currentBirthDate
    ? `${formatBirthMonthDay(currentBirthDate)} ${getBirthYear(currentBirthDate)} р.`
    : null;

  return {
    avatarInputRef,
    bannerInputRef,
    displayName,
    setDisplayName,
    bio,
    setBio,
    location,
    birthMonth,
    birthDay,
    setBirthDay,
    birthYear,
    birthDateVisibility,
    setBirthDateVisibility,
    birthYearVisibility,
    setBirthYearVisibility,
    avatarPreview,
    bannerPreview,
    isLocationOpen,
    setIsLocationOpen,
    isBirthDateEditing,
    setIsBirthDateEditing,
    isBirthDateConfirmOpen,
    setIsBirthDateConfirmOpen,
    setRemoveBirthDate,
    isSaving,
    error,
    setError,
    locationSearch,
    hasChanges,
    isConfirmOpen,
    requestClose,
    cancelDiscard,
    handleDiscardChanges,
    handleAvatarChange,
    handleBannerChange,
    handleRemoveAvatar,
    handleRemoveBanner,
    handleLocationSelect,
    handleRemoveLocation,
    handleBirthMonthChange,
    handleBirthYearChange,
    handleCancelBirthDateEditing,
    handleRemoveBirthDate,
    handleSave,
    currentBirthDateLabel,
    initialBirthDate,
  };
}
