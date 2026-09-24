import { useState } from "react";

import type { ReportSignal } from "@/admin/types/moderation";

import {
    ModerationCard,
    ModerationCardHeader,
} from "@/admin/components/moderation/cards";

import {
    ModerationCardStatus,
    ModerationCardActions,
    ModerationCardSignals,
    ModerationCardStats,
} from "@/admin/components/moderation/cards/ui";

import type { User } from "@/types";
import ModerationConfirmModal from "@/admin/components/moderation/modal/ModerationConfirmModal.tsx";

type ModerationUserCardProps = {
    item: ReportSignal;
    user: User;
    selected: boolean;
    busy: boolean;
    onToggleSelected: () => void;
    onOpen: () => void;
    onKeep: () => void;
    onBlock: () => void;
};

export default function ModerationUserCard({
    item,
    user,
    selected,
    busy,
    onOpen,
    onKeep,
    onBlock,
}: ModerationUserCardProps) {
    const [modalAction, setModalAction] = useState<"block" | null>(null);

    const isResolved = item.status === "resolved";

    const groupedSignals = [
        {
            label: item.reasonLabel,
            count: 1
        },
    ];

    const handleConfirm = () => {
        if (modalAction === "block") {
            onBlock();
        }

        setModalAction(null);
    };

    return (
        <>
            <ModerationCard
                targetType="users"
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
                        ></div>

                        <ModerationCardHeader
                            avatarUrl={user.avatarUrl}
                            displayName={
                                user.displayName ??
                                user.username
                            }
                            username={user.username}
                            typeLabel="Користувач"
                            createdAt={item.createdAt}
                        />
                    </div>

                    <ModerationCardStats
                        targetType="users"
                        followersCount={user.followersCount}
                        followingCount={user.followingCount}
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
                        onBlock={() =>
                            setModalAction("block")
                        }
                    />
                </div>
            </ModerationCard>

            <ModerationConfirmModal
                action={modalAction}
                targetType="users"
                onCancel={() => setModalAction(null)}
                onConfirm={handleConfirm}
            />
        </>
    );
}
