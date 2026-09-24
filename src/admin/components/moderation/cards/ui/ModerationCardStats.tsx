import type { ReportTargetType } from "@/admin/types/moderation";

type ModerationCardStatsProps = {
    targetType: ReportTargetType;

    followersCount?: number;
    followingCount?: number;

    likesCount?: number;
    repliesCount?: number;
    retweetsCount?: number;
};

export default function ModerationCardStats({
    targetType,
    followersCount = 0,
    followingCount = 0,
    likesCount = 0,
    repliesCount = 0,
    retweetsCount = 0,
}: ModerationCardStatsProps) {
    if (targetType === "users") {
        return (
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>
                    {followersCount} підписників
                </span>

                <span>
                    {followingCount} підписок
                </span>
            </div>
        );
    }

    return (
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>
                {likesCount} лайків
            </span>

            <span>
                {repliesCount} відповідей
            </span>

            <span>
                {retweetsCount} репостів
            </span>
        </div>
    );
}
