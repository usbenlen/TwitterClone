import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Flag } from "lucide-react";

import { Avatar, Button } from "@/ui";

import { useImageCache, useFollow } from "@/hooks";

import { EditProfileModal } from "@/components/modal";
import ReportModal from "@/components/modal/ReportModal";

import {type UpdateProfileRequest, userApi} from "@/api/user.api";
import type { User } from "@/types/user";

interface ProfileHeroProps {
    user: User;
    isOwnProfile: boolean;
    onUpdateProfile: (data: UpdateProfileRequest) => Promise<void>;
}

export default function ProfileHero({
    user,
    isOwnProfile,
    onUpdateProfile,
}: ProfileHeroProps) {
    const { src: cachedBannerUrl } = useImageCache(user.bannerUrl);
    const { follow, unfollow, isFollowing } = useFollow();
    const following = isFollowing(user.id);

    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] =
        useState(false);

    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isMenuOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target;

            if (
                target instanceof Node &&
                menuRef.current?.contains(target)
            ) {
                return;
            }

            setIsMenuOpen(false);
        };

        document.addEventListener(
            "pointerdown",
            handlePointerDown,
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handlePointerDown,
            );
        };
    }, [isMenuOpen]);

    return (
        <>
            <div className="h-40 w-full bg-muted">
                {cachedBannerUrl && (
                    <img
                        src={cachedBannerUrl}
                        alt=""
                        className="size-full object-cover"
                    />
                )}
            </div>

            <div className="px-4">
                <div className="flex items-end justify-between">
                    <div className="-mt-12">
                        <Avatar
                            name={user.displayName}
                            fallbackName={user.username}
                            src={user.avatarUrl}
                            className="size-24 border-4 border-background"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-3">
                        {!isOwnProfile && (
                            <div
                                ref={menuRef}
                                className="relative"
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setIsMenuOpen((current) => !current);
                                    }}
                                    className="cursor-pointer rounded-full px-1.5"
                                    aria-label="Додаткові дії"
                                    aria-expanded={isMenuOpen}
                                >
                                    <MoreHorizontal className="size-5" />
                                </Button>

                                {isMenuOpen && (
                                    <div
                                        className="absolute right-0 top-full z-40 mt-1 min-w-44 overflow-hidden rounded-xl border border-border bg-background py-1 shadow-xl"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsReportModalOpen(true);
                                            }}
                                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                        >
                                            <Flag className="size-4" />
                                            Подати скаргу
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {isOwnProfile ? (
                            <Button
                                className="cursor-pointer"
                                variant="outline"
                                onClick={() => setIsEditProfileOpen(true)}
                            >
                                Редагувати профіль
                            </Button>
                        ) : (
                            <Button
                                className="cursor-pointer"
                                size="sm"
                                variant={following ? "outline" : "primary"}
                                onClick={() =>
                                    following
                                        ? unfollow(user.id)
                                        : follow(user)
                                }
                            >
                                {following ? "Читаю" : "Читати"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <EditProfileModal
                open={isEditProfileOpen}
                user={user}
                onClose={() => setIsEditProfileOpen(false)}
                onSave={onUpdateProfile}
            />

            <ReportModal
                open={isReportModalOpen}
                onClose={() => {
                    setIsReportModalOpen(false);
                }}
                onSubmit={async () => {
                    await userApi.report(user.id);
                }}
            />
        </>
    );
}