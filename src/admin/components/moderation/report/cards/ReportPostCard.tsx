import { tweets } from "@/mock/data/tweets.ts";
import { moderationSignals } from "@/mock/data/admin/moderationSignals.ts";
import type { ReportStatus } from "@/admin/types/moderation";
import ModerationCardHeader from "@/admin/components/moderation/cards/ModerationCardHeader.tsx";

import ReportCard from "./ReportCard.tsx";
import ReportStats from "@/admin/components/moderation/report/cards/ui/ReportStats.tsx";
import { TweetMedia } from "@/components/tweet";

type ReportPostProps = {
    id: string;
    status?: ReportStatus;
};

export default function ReportPostCard({
   id,
}: ReportPostProps) {
    const post = tweets.find(
        (tweet) => tweet.id === id,
    );

    const signals = moderationSignals.filter(
        (signal) =>
            signal.targetType === "posts" &&
            signal.targetId === id,
    );

    if (!post) {
        return (
            <div className="grid gap-6">
                <ReportCard
                    title="Оригінальний пост"
                    openLabel="Відкрити пост"
                    openHref={`/post/${id}`}
                >
                    <p className="text-sm text-muted-foreground">
                        Пост не знайдено.
                    </p>
                </ReportCard>

                <ReportStats signals={signals} />
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <ReportCard
                title="Оригінальний пост"
                openLabel="Відкрити пост"
                openHref={`/post/${post.id}`}
            >
                <ModerationCardHeader
                    avatarUrl={post.author.avatarUrl}
                    displayName={post.author.displayName}
                    username={post.author.username}
                    typeLabel="Пост"
                    createdAt={post.createdAt}
                />

                <div className="mt-3">
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                        {post.content}
                    </p>
                </div>

                {post.attachments?.length > 0 && (
                    <div className="mt-4">
                        <TweetMedia
                            attachments={post.attachments}
                        />
                    </div>
                )}

                <div className="flex flex-wrap gap-4 pt-3 text-xs text-muted-foreground">
                    <span>
                        {post.likesCount} лайків
                    </span>

                    <span>
                        {post.repliesCount} відповідей
                    </span>

                    <span>
                        {post.retweetsCount} репостів
                    </span>
                </div>
            </ReportCard>

            <ReportStats signals={signals} />
        </div>
    );
}