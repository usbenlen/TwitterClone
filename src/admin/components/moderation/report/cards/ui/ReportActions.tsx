import {
    Ban,
    Check,
    Trash2,
} from "lucide-react";

import { Button } from "@/ui";

import {
    type ReportDecision,
    type ReportStatus,
} from "@/admin/types/moderation.ts";

import { ReportStatusInfo } from "@/admin/components/moderation/report/cards/ui/index.ts";

type ReportActionsProps = {
    status: ReportStatus;
    decision?: ReportDecision;
    busy?: boolean;
    onKeep: () => void;
    onDelete: () => void;
    onBlock?: () => void;
};

export default function ReportActions({
  status,
  decision,
  onKeep,
  onDelete,
  onBlock,
  busy = false,
}: ReportActionsProps) {
    const isResolved = status === "resolved";

    return (
        <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-border bg-card p-5">
                <header>
                    <h2 className="text-lg font-semibold">
                        Дії
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Керування рішенням щодо цієї скарги.
                    </p>
                </header>
                <div className="mt-5 space-y-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={onKeep}
                        isLoading={busy}
                        disabled={isResolved}
                    >
                        <Check className="size-4" />
                        Залишити
                    </Button>

                    {onBlock && (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start"
                            onClick={onBlock}
                            isLoading={busy}
                            disabled={isResolved}
                        >
                            <Ban className="size-4" />

                            {isResolved ? (
                                <span>Заблоковано</span>
                            ) : (
                                "Заблокувати"
                            )}
                        </Button>
                    )}

                    <Button
                        type="button"
                        variant={
                            isResolved
                                ? "outline"
                                : "destructive"
                        }
                        className="w-full justify-start"
                        onClick={onDelete}
                        isLoading={busy}
                        disabled={isResolved}
                    >
                        <Trash2 className="size-4" />

                        {isResolved ? (
                            <span>Видалено</span>
                        ) : (
                            "Видалити"
                        )}
                    </Button>
                </div>

                <ReportStatusInfo
                    status={status}
                    decision={decision}
                />
            </section>
        </aside>
    );
}