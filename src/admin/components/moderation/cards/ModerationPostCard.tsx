import { useState } from "react";
import type { ReportSignal } from "@/admin/types/moderation";
import type { Tweet } from "@/types";

import {
    ModerationCard,
    ModerationCardHeader,
} from "@/admin/components/moderation/cards";

import {
    ModerationCardStatus,
    ModerationCardActions,
    ModerationCardSignals,
    ModerationCardContent,
    ModerationCardStats,
} from "@/admin/components/moderation/cards/ui";

import { getAttachmentDescription } from "@/admin/components/moderation/utils";

import ModerationConfirmModal from "@/admin/components/moderation/modal/ModerationConfirmModal.tsx";

type ModerationPostCardProps = {
    item: ReportSignal;
    post: Tweet;
    selected: boolean;
    busy: boolean;
    onToggleSelected: () => void;
    onOpen: () => void;
    onKeep: () => void;
    onDelete: () => void;
};

export default function ModerationPostCard({
   item,
   post,
   selected,
   busy,
   onOpen,
   onKeep,
   onDelete,
}: ModerationPostCardProps) {
    const [modalAction, setModalAction] =
        useState<"delete" | null>(null);

    const isResolved =
        item.status === "resolved";

    const groupedSignals = [
        {
            label: item.reasonLabel,
            count: 1,
        },
    ];

    const attachmentDescription = getAttachmentDescription(post);

    const handleConfirm = () => {
        if (modalAction === "delete") {
            onDelete();
        }

        setModalAction(null);
    };

    return (
        <>
            <ModerationCard
                targetType="posts"
                selected={selected}
                onOpen={onOpen}
            >
                <div className="min-w-0">
                    <div className="flex items-start">
                        <div
                            className="pt-1"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        />

                        <ModerationCardHeader
                            avatarUrl={post.author.avatarUrl}
                            displayName={
                                post.author.displayName ??
                                post.author.username
                            }
                            username={post.author.username}
                            typeLabel="Пост"
                            createdAt={item.createdAt}
                        />
                    </div>

                    <ModerationCardContent
                        targetType="posts"
                        content={post.content}
                    />

                    <ModerationCardStats
                        targetType="posts"
                        likesCount={post.likesCount}
                        repliesCount={post.repliesCount}
                        retweetsCount={post.retweetsCount}
                    />

                    {attachmentDescription && (
                        <p className="mt-3 text-xs text-muted-foreground">
                            {attachmentDescription}
                        </p>
                    )}

                    <ModerationCardSignals
                        signals={groupedSignals}
                    />

                    <ModerationCardStatus
                        status={item.status}
                        decision={item.decision}
                    />
                </div>

                <div
                    onClick={(event) => event.stopPropagation()}
                >
                    <ModerationCardActions
                        targetType={item.targetType}
                        isResolved={isResolved}
                        busy={busy}
                        onKeep={onKeep}
                        onDelete={() => setModalAction("delete")}
                    />
                </div>
            </ModerationCard>

            <ModerationConfirmModal
                action={modalAction}
                targetType="posts"
                onCancel={() => setModalAction(null)}
                onConfirm={handleConfirm}
            />
        </>
    );
}