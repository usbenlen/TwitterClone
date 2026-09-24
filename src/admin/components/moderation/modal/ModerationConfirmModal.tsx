import { ConfirmModal } from "@/components/modal";

import type { ReportTargetType } from "@/admin/types/moderation";

type ModerationConfirmAction =
    | "keep"
    | "delete"
    | "block"
    | null;

type ModerationConfirmModalProps = {
    action: ModerationConfirmAction;
    targetType: ReportTargetType;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function ModerationConfirmModal({
   action,
   targetType,
   onCancel,
   onConfirm,
}: ModerationConfirmModalProps) {
    if (!action) {
        return null;
    }

    if (action === "keep") {
        return (
            <ConfirmModal
                open
                title={
                    targetType === "users"
                        ? "Залишити користувача?"
                        : targetType === "comments"
                            ? "Залишити коментар?"
                            : "Залишити пост?"
                }
                description={
                    targetType === "users"
                        ? "Скарга буде опрацьована, а користувач залишиться без змін."
                        : targetType === "comments"
                            ? "Скарга буде опрацьована, а коментар залишиться без змін."
                            : "Скарга буде опрацьована, а пост залишиться без змін."
                }
                confirmText="Залишити"
                cancelText="Скасувати"
                onCancel={onCancel}
                onConfirm={onConfirm}
            />
        );
    }

    if (action === "block") {
        return (
            <ConfirmModal
                open
                title="Заблокувати користувача?"
                description="Користувач буде заблокований."
                confirmText="Заблокувати"
                cancelText="Скасувати"
                onCancel={onCancel}
                onConfirm={onConfirm}
            />
        );
    }

    if (targetType === "users") {
        return (
            <ConfirmModal
                open
                title="Видалити користувача?"
                description="Користувач буде видалений. Цю дію неможливо скасувати."
                confirmText="Видалити"
                cancelText="Скасувати"
                onCancel={onCancel}
                onConfirm={onConfirm}
            />
        );
    }

    if (targetType === "comments") {
        return (
            <ConfirmModal
                open
                title="Видалити коментар?"
                description="Коментар буде видалений. Цю дію неможливо скасувати."
                confirmText="Видалити"
                cancelText="Скасувати"
                onCancel={onCancel}
                onConfirm={onConfirm}
            />
        );
    }

    return (
        <ConfirmModal
            open
            title="Видалити пост?"
            description="Пост буде видалений. Цю дію неможливо скасувати."
            confirmText="Видалити"
            cancelText="Скасувати"
            onCancel={onCancel}
            onConfirm={onConfirm}
        />
    );
}