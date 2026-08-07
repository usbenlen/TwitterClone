/** @format */

import { useParams, Link } from "react-router";
import { useFollow } from "@/hooks/useFollow";
import { useProfile } from "@/hooks";
import { Avatar, Button, Spinner } from "@/ui";
import { FollowNavigation } from "@/components/profile";

export default function FollowingPage() {
    const { username } = useParams();
    const { user, isLoading } = useProfile(username);
    const { following, unfollow } = useFollow();

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
                following.length === 0 ? (
                <p className="p-4 text-foreground text-2xl font-bold flex justify-center align-center">
                    Немає читачів
                </p>
                ) : (
                following.map(user => {
                return (
                    <Link
                        key={user.id}
                        to={`/${user.username}`}
                        className="flex items-center justify-between gap-3 p-4 hover:bg-muted/40"
                        >
                        <div className="flex gap-3">
                            <Avatar
                            name={user.displayName}
                            src={user.avatarUrl}
                            className="size-11"
                            />

                            <div>
                            <p className="font-semibold">
                                {user.displayName}
                            </p>

                            <p className="text-muted-foreground">
                                @{user.username}
                            </p>
                            </div>
                        </div>

                        <Button
                            onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            unfollow(user.id);
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
    </section>
  );
}