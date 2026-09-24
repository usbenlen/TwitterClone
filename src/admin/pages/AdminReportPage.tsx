import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Button, Spinner } from "@/ui";

import {
    ReportActions,
    ReportTarget,
} from "@/admin/components/moderation/report";

import {
    useModeration,
    useModerationReport,
} from "@/admin/hooks/moderation";

import ReportConfirmModal from "@/admin/components/moderation/report/modal/ReportConfirmModal";

export type ConfirmAction =
    | "keep"
    | "delete"
    | "block"
    | null;

export default function AdminReportPage() {
    const navigate = useNavigate();

    const { reportId } = useParams<{
        reportId: string;
    }>();

    const {
        isLoading: moderationLoading,
        error: moderationError,
        busyAction,
        blockItem,
        keepItem,
        deleteItem,
    } = useModeration();

    const {
        data: report,
        isLoading: reportLoading,
        error: reportError,
        updateReport,
    } = useModerationReport(reportId);

    const [confirmAction, setConfirmAction] =
        useState<ConfirmAction>(null);

    const isLoading =
        moderationLoading || reportLoading;

    const error =
        moderationError ?? reportError;

    if (isLoading) {
        return <Spinner />;
    }

    if (!report) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold">
                    Скаргу не знайдено
                </h1>
            </div>
        );
    }

    const status = report.status;

    const busy =
        isLoading || busyAction !== null;

    const handleConfirm = async () => {
        if (!confirmAction) {
            return;
        }

        try {
            if (confirmAction === "keep") {
                await keepItem(report);

                updateReport(
                    "resolved",
                    "kept",
                );
            }

            if (confirmAction === "delete") {
                await deleteItem(report);

                updateReport(
                    "resolved",
                    "deleted",
                );
            }

            if (confirmAction === "block") {
                await blockItem(report);

                updateReport(
                    "resolved",
                    "blocked",
                );
            }
        } finally {
            setConfirmAction(null);
        }
    };

    return (
        <div className="mx-auto w-full max-w-6xl">
            <div>
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

                    <p className="mt-1 text-sm text-muted-foreground font-semibold">
                        {report.targetType === "posts" &&
                            "Пост"}

                        {report.targetType ===
                            "comments" &&
                            "Коментар"}

                        {report.targetType === "users" &&
                            "Користувач"}

                        {": "}
                        {report.targetId}
                    </p>
                </div>
            </div>

            {error && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
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
                    decision={report.decision}
                    busy={busy}
                    onKeep={() => {
                        setConfirmAction("keep");
                    }}
                    onDelete={() => {
                        setConfirmAction("delete");
                    }}
                    onBlock={
                        report.targetType === "users"
                            ? () => {
                                setConfirmAction(
                                    "block",
                                );
                            }
                            : undefined
                    }
                />
            </div>

            <ReportConfirmModal
                action={confirmAction}
                targetType={report.targetType}
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