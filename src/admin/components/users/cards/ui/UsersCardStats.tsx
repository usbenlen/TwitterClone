type UserCardStatsProps = {
    followersCount: number;
    followingCount: number;
};

export default function UsersCardStats({
    followersCount,
    followingCount,
}: UserCardStatsProps) {
    return (
        <div className="mt-3 min-w-0">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>
                    {followersCount} підписників
                </span>

                <span>
                    {followingCount} підписок
                </span>
            </div>
        </div>
    );
}