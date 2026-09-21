import { commentsByPostId } from "@/mock/data/comments.ts";
import { tweets } from "@/mock/data/tweets.ts";
import { moderationSignals } from "@/mock/data/admin/moderationSignals.ts";

import type { ModerationStatus } from "@/admin/types/moderation";

import ModerationCardHeader from "@/admin/components/moderation/cards/ModerationCardHeader.tsx";
import ReportStats from "@/admin/components/moderation/report/ReportStats.tsx";

import ReportCard from "./ReportCard.tsx";

type ReportCommentProps = {
    id: string;
    status?: ModerationStatus;
};

export function ReportCommentCard({
    id,
}: ReportCommentProps) {
    const comment = Object.values(commentsByPostId)
        .flat()
        .find((item) => item.id === id);

    const signals = moderationSignals.filter(
        (signal) =>
            signal.targetType === "comments" &&
            signal.targetId === id,
    );

    if (!comment) {
        return (
            <div className="space-y-6">
                <ReportCard
                    title="Оригінальний коментар"
                    openLabel="Відкрити коментар"
                    openHref={`/comment/${id}`}
                >
                    <p className="text-sm text-muted-foreground">
                        Коментар не знайдено.
                    </p>
                </ReportCard>

                <ReportStats signals={signals} />
            </div>
        );
    }

    const post = tweets.find(
        (tweet) => tweet.id === comment.postId,
    );

    return (
        <div className="space-y-6">
            <ReportCard
                title="Оригінальний коментар"
                openLabel="Відкрити коментар"
                openHref={`/post/${comment.postId}#${comment.id}`}
            >
                <div>
                    <ModerationCardHeader
                        avatarUrl={comment.author.avatarUrl}
                        displayName={comment.author.displayName}
                        username={comment.author.username}
                        typeLabel="Коментар"
                        createdAt={comment.createdAt}
                    />

                    <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                        {comment.content}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>
                            {comment.likesCount} лайків
                        </span>

                        <span>
                            {comment.repliesCount} відповідей
                        </span>

                        <span>
                            {comment.retweetsCount} репостів
                        </span>
                    </div>
                </div>

                {post && (
                    <div className="mt-5 border-t border-border pt-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Пост
                        </p>

                        <ModerationCardHeader
                            avatarUrl={post.author.avatarUrl}
                            displayName={post.author.displayName}
                            username={post.author.username}
                            typeLabel="Пост"
                            createdAt={post.createdAt}
                        />

                        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                            {post.content}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
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
                    </div>
                )}
            </ReportCard>

            <ReportStats signals={signals} />
        </div>
    );
}