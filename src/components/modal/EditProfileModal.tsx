/** @format */

import { useEffect, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";

import type { Location, User } from "@/types";
import type { UpdateProfileRequest } from "@/api/user.api";

import { useLocationSearch } from "@/hooks/location/useLocationSearch";

import LocationPicker from "@/components/composer/location/LocationPicker";
import { ConfirmModal } from "@/components/modal/ConfirmModal";

import { Avatar, Button, Input } from "@/ui";

import { MAX_BIO_LENGTH } from "@/constants/app";

interface EditProfileModalProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onSave: (data: UpdateProfileRequest) => Promise<void>;
}

export default function EditProfileModal({
  open,
  user,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? "");
  const [location, setLocation] = useState<Location | null>(
    user.location ?? null,
  );

  const [avatar, setAvatar] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);
  const [bannerPreview, setBannerPreview] = useState(user.bannerUrl);

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locationSearch = useLocationSearch();

  useEffect(() => {
    if (!open) return;

    setDisplayName(user.displayName);
    setBio(user.bio ?? "");
    setLocation(user.location ?? null);

    setAvatar(null);
    setBanner(null);

    setAvatarPreview(user.avatarUrl);
    setBannerPreview(user.bannerUrl);

    setIsLocationOpen(false);
    locationSearch.reset();

    setError(null);
  }, [open, user]);

  const hasChanges =
    displayName.trim() !== user.displayName ||
    bio.trim() !== (user.bio ?? "") ||
    avatar !== null ||
    banner !== null ||
    location?.id !== user.location?.id;

  const requestClose = () => {
    if (isSaving) return;

    if (hasChanges) {
      setIsConfirmOpen(true);
      return;
    }

    onClose();
  };

  const handleDiscardChanges = () => {
    setIsConfirmOpen(false);
    setIsLocationOpen(false);
    locationSearch.reset();

    setDisplayName(user.displayName);
    setBio(user.bio ?? "");
    setLocation(user.location ?? null);

    setAvatar(null);
    setBanner(null);

    setAvatarPreview(user.avatarUrl);
    setBannerPreview(user.bannerUrl);

    setError(null);

    onClose();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleLocationSelect = (value: Location) => {
    setLocation(value);
    setIsLocationOpen(false);
    locationSearch.reset();
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      await onSave({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        location,
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={requestClose}
                disabled={isSaving}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
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
                  src={avatarPreview}
                  className="size-24 border-4 border-background"
                />

                {/* Avatar hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <Pencil size={20} />
                </div>
              </div>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
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
                maxLength={50}
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
                    if (isLocationOpen) locationSearch.reset();
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
                        setLocation(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          setLocation(null);
                        }
                      }}
                      className="ml-2 flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDiscardChanges}
      />
    </>
  );
}
