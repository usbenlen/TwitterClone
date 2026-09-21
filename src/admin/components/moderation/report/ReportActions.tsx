import { Ban, Check, Trash2 } from "lucide-react";

import { Button } from "@/ui";

type ReportActionsProps = {
    status: ModerationStatus;
    busy?: boolean;
    onKeep: () => void;
    onDelete: () => void;
    onBlock?: () => void;
};

import {
    type ModerationStatus,
    statusLabels,
} from "@/admin/types/moderation";


export function ReportActions({
  status,
  // busy = false,
  onKeep,
  onDelete,
  onBlock,
}: ReportActionsProps) {
    return (
        <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-lg font-semibold">
                    Дії
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Виберіть дію цього об'єкта.
                </p>

                <div className="mt-5 space-y-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={onKeep}
                        // disabled={busy}
                    >
                        <Check className="size-4" />
                        Залишити
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={onDelete}
                        // disabled={busy}
                    >
                        <Trash2 className="size-4" />
                        Видалити
                    </Button>

                    {onBlock && (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start"
                            onClick={onBlock}
                            // disabled={busy}
                        >
                            <Ban className="size-4" />
                            Заблокувати
                        </Button>
                    )}
                </div>

                <div className="mt-5 border-t border-border pt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Статус
                    </p>

                    <p
                        className={`mt-1 text-sm font-semibold ${
                            status === "deleted" || status === "blocked"
                                ? "text-destructive"
                                : "text-foreground"
                        }`}
                    >
                        {statusLabels[status]}
                    </p>
                </div>
            </section>
        </aside>
    );
}