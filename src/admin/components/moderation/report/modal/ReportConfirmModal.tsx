import { ConfirmModal } from "@/components/modal/ConfirmModal.tsx";
import type { ReportTargetType } from "@/admin/types/moderation.ts";

export type ConfirmAction =
    | "keep"
    | "delete"
    | "block"
    | null;

type ReportConfirmModalProps = {
    action: ConfirmAction;
    targetType: ReportTargetType;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function ReportConfirmModal({
   action,
   targetType,
   onCancel,
   onConfirm,
}: ReportConfirmModalProps) {
    if (!action) {
        return null;
    }

    const getContent = () => {
        if (action === "delete") {
            if (targetType === "comments") {
                return {
                    title: "Видалити коментар?",
                    description: "Коментар буде видалений. Цю дію неможливо скасувати.",
                    confirmText: "Видалити",
                };
            }

            return {
                title: "Видалити пост?",
                description: "Пост буде видалений. Цю дію неможливо скасувати.",
                confirmText: "Видалити",
            };
        }

        if (action === "block") {
            return {
                title: "Заблокувати користувача?",
                description: "Користувач буде заблокований.",
                confirmText: "Заблокувати",
            };
        }

        return {
            title: "Залишити об'єкт?",
            description: "Скарга буде опрацьована, а об'єкт залишиться без змін.",
            confirmText: "Залишити",
        };
    };

    const content = getContent();

    return (
        <ConfirmModal
            open={action !== null}
            title={content.title}
            description={content.description}
            confirmText={content.confirmText}
            cancelText="Скасувати"
            onCancel={onCancel}
            onConfirm={onConfirm}
        />
    );
}