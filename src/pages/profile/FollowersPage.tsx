/** @format */

import { useParams, Link } from "react-router";
import { useFollow } from "@/hooks/useFollow";
import { useProfile } from "@/hooks";
import { Avatar, Button, Spinner } from "@/ui";
import { FollowNavigation } from "@/components/profile"
import { useState } from "react"
import type { User } from "@/types/user";
import { ConfirmModal } from "@/components/modal/ConfirmModal"
import type { FollowUser } from "@/types/follow";

export default function FollowersPage() {
    const { username } = useParams();
    const { user, isLoading } = useProfile(username); 
    const { followers, removeFollower } = useFollow();
    const [openModal, setOpenModal] = useState(false);
    const [selectedFollower, setSelectedFollower] = useState<FollowUser | null>(null);

    if (isLoading) {
        return (
            <div className="max-w-3xl flex justify-center border-r border-border py-16">
                <Spinner />
            </div>
        );
    }
    
    if (!user) return null;

    return (
        <section className="max-w-3xl border-r bg-background">
        <FollowNavigation user={user}/>
        
        <div className="divide-y divide-border">
            {
                followers.length === 0 ? (
                <p className="p-4 text-foreground text-2xl font-bold flex justify-center align-center">
                    Немає читачів
                </p>
                ) : (
                followers.map(follower => {
                return (
                    <Link
                        key={follower.id}
                        to={`/${follower.username}`}
                        className="flex items-center justify-between gap-3 p-4 hover:bg-muted/40"
                        >
                        <div className="flex gap-3">
                            <Avatar
                            name={follower.displayName}
                            src={follower.avatarUrl}
                            className="size-11"
                            />

                            <div>
                            <p className="font-semibold">
                                {follower.displayName}
                            </p>

                            <p className="text-muted-foreground">
                                @{follower.username}
                            </p>
                            </div>
                        </div>

                        <Button
                            onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedFollower(follower);
                            setOpenModal(true);

                            }}
                                size="sm"
                                variant="outline"
                            >
                            Підписки
                        </Button>

                    </Link>
                    );
                })
            )}
        </div>

        <ConfirmModal
            open={openModal}
            title="Видалити читача?"
            description="Цей користувач більше не буде вашим читачем."
            onCancel={() => {
                setOpenModal(false);
                setSelectedFollower(null);
            }}
            onConfirm={() => {
                if (!selectedFollower) return;

                removeFollower(
                user.id,
                selectedFollower.id
                );

                setOpenModal(false);
                setSelectedFollower(null);
            }}
            />
    </section>
  );
}