import { useState } from "react";
import {
    ArrowLeft,
} from "lucide-react";
import {
    useNavigate,
    useParams,
} from "react-router";

import { Button } from "@/ui";
import { moderationSignals } from "@/mock/data/admin/moderationSignals";

import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { ReportActions } from "@/admin/components/moderation/report/ReportActions";
import { ReportTarget } from "@/admin/components/moderation/report/ReportTarget";
import { useModeration } from "@/admin/hooks/moderation/useModeration";

type ConfirmAction =
    | "keep"
    | "delete"
    | "block"
    | null;

export default function AdminReportPage() {
    const navigate = useNavigate();

    const {
        items,
        isLoading,
        error,
        busyAction,
        blockItem,
        keepItem,
        deleteItem,
    } = useModeration();

    const { reportId } = useParams<{
        reportId: string;
    }>();

    const [confirmAction, setConfirmAction] =
        useState<ConfirmAction>(null);

    const report = moderationSignals.find(
        (signal) => signal.id === reportId,
    );

    if (!report) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold">
                    Скаргу не знайдено
                </h1>
            </div>
        );
    }

    const item = items.find(
        (currentItem) =>
            currentItem.type === report.targetType &&
            currentItem.id === report.targetId,
    );

    const status =
        item?.status ??
        report.status ??
        "pending";

    const busy =
        isLoading ||
        busyAction !== null;

    const handleConfirm = async () => {
        if (!item || !confirmAction) {
            return;
        }

        try {
            if (confirmAction === "keep") {
                await keepItem(item);
            }

            if (confirmAction === "delete") {
                await deleteItem(item);
            }

            if (confirmAction === "block") {
                await blockItem(item);
            }
        } finally {
            setConfirmAction(null);
        }
    };

    const getModalContent = () => {
        switch (confirmAction) {
            case "keep":
                return {
                    title: "Залишити об'єкт?",
                    description:
                        "Скарга буде опрацьована, а об'єкт залишиться без змін.",
                    confirmText: "Залишити",
                };

            case "delete":
                return {
                    title: "Видалити об'єкт?",
                    description:
                        "Об'єкт буде позначений як віддалений. Ця дія змінить його статус.",
                    confirmText: "Видалити",
                };

            case "block":
                return {
                    title: "Заблокувати користувача?",
                    description:
                        "Користувач буде заблокований.",
                    confirmText: "Заблокувати",
                };

            default:
                return {
                    title: "",
                    description: "",
                    confirmText: "",
                };
        }
    };

    const modalContent =
        getModalContent();

    return (
        <div className="mx-auto w-full max-w-6xl">
            <header>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="-ml-2"
                >
                    <ArrowLeft className="size-4" />
                    Назад до модерації
                </Button>

                <div className="mt-5">
                    <h1 className="text-2xl font-semibold">
                        Деталі модерації: {report.id}
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {report.targetType === "posts" &&
                            "Пост"}

                        {report.targetType === "comments" &&
                            "Коментар"}

                        {report.targetType === "users" &&
                            "Користувач"}

                        {" · "}
                        {report.targetId}
                    </p>
                </div>
            </header>

            {error && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <main className="min-w-0 space-y-6">
                    <ReportTarget
                        target={{
                            type: report.targetType,
                            id: report.targetId,
                        }}
                        status={status}
                    />
                </main>

                <ReportActions
                    status={status}
                    busy={busy || !item}
                    onKeep={() => {
                        setConfirmAction("keep");
                    }}
                    onDelete={() => {
                        setConfirmAction("delete");
                    }}
                    onBlock={
                        report.targetType === "users"
                            ? () => {
                                setConfirmAction("block");
                            }
                        : undefined
                    }
                />
            </div>

            <ConfirmModal
                open={confirmAction !== null}
                title={modalContent.title}
                description={modalContent.description}
                confirmText={modalContent.confirmText}
                cancelText="Скасування"
                onCancel={() => {
                    if (!busy) {
                        setConfirmAction(null);
                    }
                }}
                onConfirm={handleConfirm}
            />
        </div>
    );
}