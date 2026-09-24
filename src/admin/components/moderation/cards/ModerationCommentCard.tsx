import { useState } from "react";
import type { ReportSignal } from "@/admin/types/moderation";
import type { Comment } from "@/types";

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

import ModerationConfirmModal from "@/admin/components/moderation/modal/ModerationConfirmModal.tsx";

type ModerationCommentCardProps = {
    item: ReportSignal;
    comment: Comment;
    selected: boolean;
    busy: boolean;
    onToggleSelected: () => void;
    onOpen: () => void;
    onKeep: () => void;
    onDelete: () => void;
};

export default function ModerationCommentCard({
    item,
    comment,
    selected,
    busy,
    onOpen,
    onKeep,
    onDelete,
}: ModerationCommentCardProps) {
    const [modalAction, setModalAction] =
        useState<"delete" | null>(null);

    const groupedSignals = [
        {
            label: item.reasonLabel,
            count: 1,
        },
    ];

    const isResolved =
        item.status === "resolved";

    const handleConfirm = () => {
        if (modalAction === "delete") {
            onDelete();
        }

        setModalAction(null);
    };

    return (
        <>
            <ModerationCard
                targetType="comments"
                selected={selected}
                onOpen={onOpen}
            >
                <div className="min-w-0">
                    <div className="flex items-start">
                        <div
                            className="pt-1"
                            onClick={(event) => event.stopPropagation()}
                        >
                        </div>

                        <ModerationCardHeader
                            avatarUrl={comment.author.avatarUrl}
                            displayName={comment.author.displayName}
                            username={comment.author.username}
                            typeLabel="Коментар"
                            createdAt={comment.createdAt}
                        />
                    </div>

                    <ModerationCardContent
                        targetType="comments"
                        content={comment.content}
                    />

                    <ModerationCardStats
                        targetType="comments"
                        likesCount={comment.likesCount}
                        repliesCount={comment.repliesCount}
                        retweetsCount={comment.retweetsCount}
                    />

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
                        onDelete={() =>
                            setModalAction("delete")
                        }
                    />
                </div>
            </ModerationCard>

            <ModerationConfirmModal
                action={modalAction}
                targetType="comments"
                onCancel={() => setModalAction(null)}
                onConfirm={handleConfirm}
            />
        </>
    );
}
