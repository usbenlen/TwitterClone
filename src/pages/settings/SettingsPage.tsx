import { useState } from "react";
import { Link } from "react-router";
import { Bell, LockKeyhole, Palette, UserRound, ArrowRight } from "lucide-react";

import { userApi, type UpdateProfileRequest } from "@/api";

import { useAuth, useTheme } from "@/hooks";

import { EditProfileModal } from "@/components/modal/index";
import { PageHeader } from "@/components/layout/pageHeader/index";
import { AccountConnections } from "@/components/auth/AccountConnections";
import { RightSidebarFooterLinks } from "@/components/layout/desktop/rightSidebar";

import { THEME_OPTIONS, APP_NAME, APP_ROUTES } from "@/constants";
import { AppLogo } from "@/ui";

import { cn } from "@/utils/cn";

export default function SettingsPage({
  variant = "main",
}: {
  variant?: "main" | "admin";
}) {
  const { user, updateUser: updateAuthUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const handleUpdateProfile = async (data: UpdateProfileRequest) => {
    const updatedUser = await userApi.updateProfile(data);
    updateAuthUser(updatedUser);
  };

  if (!user) return null;

  return (
    <>
      <section
        className={cn(
          "w-full bg-background",
          variant === "main" && "max-w-3xl border-r border-border",
          variant === "admin" && "mx-auto max-w-3xl",
        )}
      >
        {variant === "main" ? (
          <PageHeader title="Налаштування" />
        ) : (
          <header>
            <h1 className="text-xl font-bold sm:text-2xl">Налаштування</h1>
          </header>
        )}

        <div className="mx-auto w-full max-w-2xl px-4 py-6">
          <p className="mb-6 text-sm text-muted-foreground">
            Керуйте виглядом профілю та налаштуваннями {APP_NAME}.
          </p>

          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            {variant === "main" && (
              <Link to={APP_ROUTES.SETTINGS_NOTIFICATIONS} className="flex items-center gap-3 border-b border-border p-5 transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
                <Bell className="size-5 shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <h2 className="font-semibold">Сповіщення</h2>
                  <p className="text-sm text-muted-foreground">Оберіть, про які події отримувати сповіщення</p>
                </div>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            )}
            {/* Appearance */}
            <section className="border-b border-border p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <Palette className="size-5" />
                </div>

                <div>
                  <h2 className="font-semibold">Тема</h2>

                  <p className="text-sm text-muted-foreground">
                    Оберіть вигляд застосунку
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    className={cn(
                      "flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-2.5 text-xs transition sm:flex-row sm:gap-2 sm:px-3 sm:text-sm",
                      "dark:focus-visible:focus-indicator",
                      theme === value
                        ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                        : "border-border hover:bg-muted dark:border-control-border dark:hover:bg-surface-hover dark:active:bg-muted",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="max-w-full truncate">{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Account */}
            <section className="p-5">
              <div className="mb-4">
                <h2 className="font-semibold">Акаунт</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Керуйте інформацією та безпекою свого акаунта.
                </p>
              </div>

              <div className="space-y-1">
                {/* Edit profile */}
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-muted cursor-pointer dark:hover:bg-surface-hover dark:active:bg-muted dark:focus-visible:focus-indicator"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                      <UserRound className="size-5" />
                    </div>

                    <div>
                      <h2 className="font-semibold">Редагувати профіль</h2>

                      <p className="text-sm text-muted-foreground">
                        Ім'я, опис, локація та фото профілю
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="size-4" />
                </button>

                {/* Change password */}
                <Link
                  to={APP_ROUTES.SETTINGS_CHANGE_PASSWORD}
                  className="flex items-center justify-between rounded-xl p-3 transition hover:bg-muted dark:hover:bg-surface-hover dark:active:bg-muted dark:focus-visible:focus-indicator"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                      <LockKeyhole className="size-5" />
                    </div>

                    <div>
                      <h2 className="font-semibold">Змінити пароль</h2>

                      <p className="text-sm text-muted-foreground">
                        Оновіть пароль свого акаунта
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </section>
            <AccountConnections key={user.id} />
          </div>
          <div className="mt-8 border-t border-border pt-8 lg:hidden">
            <AppLogo className="mx-auto block w-fit text-5xl" />
            <RightSidebarFooterLinks className="mt-4 text-center [&>div]:justify-center" />
          </div>
        </div>
      </section>

      <EditProfileModal
        open={isEditProfileOpen}
        user={user}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleUpdateProfile}
      />
    </>
  );
}
