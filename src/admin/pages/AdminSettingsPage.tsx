import { useState } from "react";
import { Link } from "react-router";
import {
    LockKeyhole,
    Moon,
    Palette,
    Sun,
    UserRound,
    Monitor,
    ArrowRight,
} from "lucide-react";

import { userApi, type UpdateProfileRequest } from "@/api";

import { useAuth, useTheme } from "@/hooks";

import { EditProfileModal } from "@/components/modal";

import { APP_ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export default function AdminSettingsPage() {
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
            <main className="mx-auto w-full max-w-2xl px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Налаштування</h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Керуйте виглядом профілю та налаштуваннями Chirp.
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-background">
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
                            <button
                                type="button"
                                onClick={() => setTheme("light")}
                                className={cn(
                                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition",
                                    theme === "light"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border hover:bg-muted",
                                )}
                            >
                                <Sun className="size-4" />
                                Світла
                            </button>

                            <button
                                type="button"
                                onClick={() => setTheme("dark")}
                                className={cn(
                                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition",
                                    theme === "dark"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border hover:bg-muted",
                                )}
                            >
                                <Moon className="size-4" />
                                Темна
                            </button>

                            <button
                                type="button"
                                onClick={() => setTheme("system")}
                                className={cn(
                                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition",
                                    theme === "system"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border hover:bg-muted",
                                )}
                            >
                                <Monitor className="size-4" />
                                Системна
                            </button>
                        </div>
                    </section>

                    <section className="p-5">
                        <div className="mb-4">
                            <h2 className="font-semibold">Акаунт</h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Керуйте інформацією та безпекою свого акаунта.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <button
                                type="button"
                                onClick={() => setIsEditProfileOpen(true)}
                                className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-muted cursor-pointer"
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

                            <Link
                                to={APP_ROUTES.SETTINGS_CHANGE_PASSWORD}
                                className="flex items-center justify-between rounded-xl p-3 transition hover:bg-muted"
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
                </div>
            </main>

            <EditProfileModal
                open={isEditProfileOpen}
                user={user}
                onClose={() => setIsEditProfileOpen(false)}
                onSave={handleUpdateProfile}
            />
        </>
    );
}
