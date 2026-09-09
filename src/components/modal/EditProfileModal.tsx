import { useEffect, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";

import type { UpdateProfileRequest } from "@/api/user.api";

import { useLocationSearch, useUnsavedChangesGuard } from "@/hooks";
import { invalidateImageCache } from "@/hooks/useImageCache";

import { Avatar, Button, Input } from "@/ui";

import { LocationPicker } from "@/components/composer";
import { ConfirmModal } from "@/components/modal/ConfirmModal";

import { MAX_BIO_LENGTH, MAX_NAME_LENGTH } from "@/constants/app";

import type { Location, User } from "@/types";

interface EditProfileModalProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onSave: (data: UpdateProfileRequest) => Promise<void>;
}

export default function EditProfileModal(props: EditProfileModalProps) {
  const { open, user } = props;

  if (!open) return null;

  return <EditProfileModalInner key={`edit-profile-${user.id}`} {...props} />;
}

function EditProfileModalInner({
  open,
  user,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const avatarPreviewUrlRef = useRef<string | null>(null);
  const bannerPreviewUrlRef = useRef<string | null>(null);

  const initialDisplayName = user.displayName?.trim() || user.username;
  const initialBio = user.bio ?? "";
  const initialLocation = user.location ?? null;

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [location, setLocation] = useState<Location | null>(initialLocation);

  const [avatar, setAvatar] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);
  const [bannerPreview, setBannerPreview] = useState(user.bannerUrl);

  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const [removeLocation, setRemoveLocation] = useState(false);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locationSearch = useLocationSearch();

  useEffect(() => {
    return () => {
      if (avatarPreviewUrlRef.current) URL.revokeObjectURL(avatarPreviewUrlRef.current);
      if (bannerPreviewUrlRef.current) URL.revokeObjectURL(bannerPreviewUrlRef.current);
    };
  }, []);

  const hasChanges =
    displayName.trim() !== initialDisplayName ||
    bio.trim() !== initialBio ||
    avatar !== null ||
    banner !== null ||
    removeLocation ||
    removeAvatar ||
    removeBanner ||
    location?.id !== initialLocation?.id;

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

    setAvatar(null);
    setBanner(null);

    if (avatarPreviewUrlRef.current) {
      URL.revokeObjectURL(avatarPreviewUrlRef.current);
      avatarPreviewUrlRef.current = null;
    }

    if (bannerPreviewUrlRef.current) {
      URL.revokeObjectURL(bannerPreviewUrlRef.current);
      bannerPreviewUrlRef.current = null;
    }

    setAvatarPreview(user.avatarUrl);
    setBannerPreview(user.bannerUrl);

    setRemoveLocation(false);
    setRemoveAvatar(false);
    setRemoveBanner(false);

    setError(null);

    confirmDiscard();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (avatarPreviewUrlRef.current) URL.revokeObjectURL(avatarPreviewUrlRef.current);

    const previewUrl = URL.createObjectURL(file);

    avatarPreviewUrlRef.current = previewUrl;

    setAvatar(file);
    setRemoveAvatar(false);
    setAvatarPreview(previewUrl);
  };

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (bannerPreviewUrlRef.current) URL.revokeObjectURL(bannerPreviewUrlRef.current);

    const previewUrl = URL.createObjectURL(file);

    bannerPreviewUrlRef.current = previewUrl;

    setBanner(file);
    setRemoveBanner(false);
    setBannerPreview(previewUrl);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);

    if (avatarPreviewUrlRef.current) {
      URL.revokeObjectURL(avatarPreviewUrlRef.current);
      avatarPreviewUrlRef.current = null;
    }

    setRemoveAvatar(Boolean(user.avatarUrl));
  };

  const handleRemoveBanner = () => {
    setBanner(null);
    setBannerPreview(null);

    if (bannerPreviewUrlRef.current) {
      URL.revokeObjectURL(bannerPreviewUrlRef.current);
      bannerPreviewUrlRef.current = null;
    }

    setRemoveBanner(Boolean(user.bannerUrl));
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

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      if (avatar || removeAvatar) await invalidateImageCache(user.avatarUrl);

      if (banner || removeBanner) await invalidateImageCache(user.bannerUrl);

      await onSave({
        displayName: displayName.trim() || user.username,
        bio: bio.trim() || undefined,

        location: removeLocation ? undefined : location,

        removeLocation,
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

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) requestClose();
        }}
      >
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-content flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={requestClose}
                disabled={isSaving}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Закрити"
              >
                <X size={20} />
              </button>

              <h2 className="text-lg font-bold">Редагувати профіль</h2>

              {hasChanges && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Є незбережені зміни
                </p>
              )}
            </div>

            <Button
              className="cursor-pointer"
              type="button"
              size="sm"
              isLoading={isSaving}
              onClick={() => void handleSave()}
            >
              Зберегти
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto">
            {/* Banner */}
            <div
              className="group relative h-48 cursor-pointer bg-muted"
              onClick={() => bannerInputRef.current?.click()}
            >
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                  Додайте банер
                </div>
              )}

              {/* Banner hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/35">
                <div className="flex size-12 items-center justify-center text-white opacity-0 transition-all group-hover:opacity-100">
                  <Pencil size={21} />
                </div>
              </div>

              {bannerPreview && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveBanner();
                  }}
                  className="absolute right-3 top-3 z-content flex size-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                  aria-label="Видалити банер"
                >
                  <X size={18} />
                </button>
              )}

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleBannerChange}
              />
            </div>

            {/* Avatar */}
            <div className="relative -mt-12 ml-5 size-24">
              <div
                className="group relative size-24 cursor-pointer overflow-hidden rounded-full"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Avatar
                  name={displayName}
                  fallbackName={user.username}
                  src={avatarPreview}
                  className="size-24 border-4 border-background"
                />

                {/* Avatar hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <Pencil size={20} />
                </div>
              </div>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -right-1 -top-1 z-content flex size-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                  aria-label="Видалити аватар"
                >
                  <X size={15} />
                </button>
              )}

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="space-y-5 p-5">
              {error && (
                <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              {/* Name */}
              <Input
                label="Ім'я"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={MAX_NAME_LENGTH}
              />

              {/* Bio */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Біографія
                </label>

                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={MAX_BIO_LENGTH}
                  rows={4}
                  placeholder="Розкажіть трохи про себе"
                  className="w-full resize-none rounded-lg border border-border bg-background p-3 outline-none transition focus:ring-2 focus:ring-ring"
                />

                <div className="mt-1 text-right text-xs text-muted-foreground">
                  {bio.length}/{MAX_BIO_LENGTH}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Розташування
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsLocationOpen((value) => !value);

                    if (isLocationOpen) {
                      locationSearch.reset();
                    }
                  }}
                  className="flex min-h-10 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-left outline-none transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-ring"
                >
                  <span
                    className={
                      location ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {location
                      ? `${location.name}, ${location.country}`
                      : "Додати локацію"}
                  </span>

                  {location && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveLocation();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          handleRemoveLocation();
                        }
                      }}
                      className="ml-2 flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Видалити локацію"
                    >
                      <X size={16} />
                    </span>
                  )}
                </button>

                {isLocationOpen && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <LocationPicker
                      locations={locationSearch.locations}
                      query={locationSearch.query}
                      loading={locationSearch.loading}
                      error={locationSearch.error}
                      onQueryChange={locationSearch.setQuery}
                      onSelect={handleLocationSelect}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Вийти без збереження?"
        description="У вас є незбережені зміни. Якщо вийти зараз, вони будуть втрачені."
        confirmText="Вийти без збереження"
        cancelText="Скасувати"
        onCancel={cancelDiscard}
        onConfirm={handleDiscardChanges}
      />
    </>
  );
}
