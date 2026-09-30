import { useEditProfileForm, useBodyScrollLock } from "@/hooks";
import { Balloon, Pencil, X } from "lucide-react";
import { useRef } from "react";

import type { UpdateProfileRequest } from "@/api/user.api";

import { Avatar, Button, Input } from "@/ui";

import { LocationPicker } from "@/components/composer";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import BirthDateEditor from "@/components/modal/BirthDateEditor";

import { MAX_BIO_LENGTH, MAX_NAME_LENGTH, MEDIA } from "@/constants/app";

import type { User } from "@/types";

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
  useBodyScrollLock(open);

  const form = useEditProfileForm({ user, onClose, onSave });
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) form.guard.requestClose();
        }}
      >
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-content flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={form.guard.requestClose}
                disabled={form.ui.isSaving}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Закрити"
              >
                <X size={20} />
              </button>

              <h2 className="text-lg font-bold">Редагувати профіль</h2>

              {form.hasChanges && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Є незбережені зміни
                </p>
              )}
            </div>

            <Button
              className="cursor-pointer"
              type="button"
              size="sm"
              isLoading={form.ui.isSaving}
              onClick={() => void form.handleSave()}
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
              {form.banner.preview ? (
                <img
                  src={form.banner.preview}
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

              {form.banner.preview && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    form.banner.remove();
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
                accept={MEDIA.IMAGE.ALLOWED_TYPES.join(",")}
                className="hidden"
                onChange={form.banner.onChange}
              />
            </div>

            {/* Avatar */}
            <div className="relative -mt-12 ml-5 size-24">
              <div
                className="group relative size-24 cursor-pointer overflow-hidden rounded-full"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Avatar
                  userId={user.id}
                  name={form.values.displayName}
                  fallbackName={user.username}
                  src={form.avatar.preview}
                  className="size-24 border-4 border-background"
                />

                {/* Avatar hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <Pencil size={20} />
                </div>
              </div>

              {form.avatar.preview && (
                <button
                  type="button"
                  onClick={form.avatar.remove}
                  className="absolute -right-1 -top-1 z-content flex size-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                  aria-label="Видалити аватар"
                >
                  <X size={15} />
                </button>
              )}

              <input
                ref={avatarInputRef}
                type="file"
                accept={MEDIA.IMAGE.ALLOWED_TYPES.join(",")}
                className="hidden"
                onChange={form.avatar.onChange}
              />
            </div>

            <div className="space-y-5 p-5">
              {form.ui.error && (
                <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {form.ui.error}
                </p>
              )}

              {/* Name */}
              <Input
                label="Ім'я"
                value={form.values.displayName}
                onChange={(event) =>
                  form.updateValues({ displayName: event.target.value })
                }
                maxLength={MAX_NAME_LENGTH}
              />

              {/* Bio */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Біографія
                </label>

                <textarea
                  value={form.values.bio}
                  onChange={(event) =>
                    form.updateValues({ bio: event.target.value })
                  }
                  maxLength={MAX_BIO_LENGTH}
                  rows={4}
                  placeholder="Розкажіть трохи про себе"
                  className="w-full resize-none rounded-lg border border-border bg-background p-3 outline-none transition focus:ring-2 focus:ring-ring"
                />

                <div className="mt-1 text-right text-xs text-muted-foreground">
                  {form.values.bio.length}/{MAX_BIO_LENGTH}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Розташування
                </label>

                <button
                  type="button"
                  onClick={form.toggleLocation}
                  className="flex min-h-10 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-left outline-none transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-ring"
                >
                  <span
                    className={
                      form.values.location
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {form.values.location
                      ? `${form.values.location.name}, ${form.values.location.country}`
                      : "Додати локацію"}
                  </span>

                  {form.values.location && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        form.handleRemoveLocation();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          form.handleRemoveLocation();
                        }
                      }}
                      className="ml-2 flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Видалити локацію"
                    >
                      <X size={16} />
                    </span>
                  )}
                </button>

                {form.ui.isLocationOpen && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <LocationPicker
                      locations={form.locationSearch.locations}
                      query={form.locationSearch.query}
                      loading={form.locationSearch.loading}
                      error={form.locationSearch.error}
                      onQueryChange={form.locationSearch.setQuery}
                      onSelect={form.handleLocationSelect}
                    />
                  </div>
                )}
              </div>

              {/* Birth date */}
              {form.ui.isBirthDateEditing ? (
                <BirthDateEditor
                  month={form.values.birthMonth}
                  day={form.values.birthDay}
                  year={form.values.birthYear}
                  dateVisibility={form.values.birthDateVisibility}
                  yearVisibility={form.values.birthYearVisibility}
                  canRemove={Boolean(user.birthDate)}
                  onMonthChange={form.handleBirthMonthChange}
                  onDayChange={(birthDay) =>
                    form.updateBirthDate({ birthDay, removeBirthDate: false })
                  }
                  onYearChange={form.handleBirthYearChange}
                  onDateVisibilityChange={(birthDateVisibility) =>
                    form.updateBirthDate({ birthDateVisibility })
                  }
                  onYearVisibilityChange={(birthYearVisibility) =>
                    form.updateBirthDate({ birthYearVisibility })
                  }
                  onCancel={form.handleCancelBirthDateEditing}
                  onRemove={form.handleRemoveBirthDate}
                />
              ) : (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Balloon
                      className="size-5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Дата народження</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {form.currentBirthDateLabel ?? "Не вказано"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      form.updateUi({ isBirthDateConfirmOpen: true })
                    }
                    className="shrink-0 cursor-pointer text-sm font-semibold text-primary hover:underline"
                  >
                    {form.currentBirthDateLabel ? "Редагувати" : "Додати"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={form.ui.isBirthDateConfirmOpen}
        title="Редагувати дату народження?"
        description="Дату народження можна змінити лише кілька разів. Переконайтеся, що ви вказуєте вік людини, яка користується цим акаунтом."
        confirmText="Редагувати"
        cancelText="Скасувати"
        confirmVariant="primary"
        onCancel={() => form.updateUi({ isBirthDateConfirmOpen: false })}
        onConfirm={() =>
          form.updateUi({
            isBirthDateConfirmOpen: false,
            isBirthDateEditing: true,
          })
        }
      />

      <ConfirmModal
        open={form.guard.isConfirmOpen}
        title="Вийти без збереження?"
        description="У вас є незбережені зміни. Якщо вийти зараз, вони будуть втрачені."
        confirmText="Вийти без збереження"
        cancelText="Скасувати"
        onCancel={form.guard.cancelDiscard}
        onConfirm={form.handleDiscardChanges}
      />
    </>
  );
}
