import { Ban, Trash2 } from "lucide-react";

import { Button } from "@/ui";

import type { ReportTargetType } from "@/admin/types/moderation";

type ModerationCardActionsProps = {
    targetType: ReportTargetType;
    isResolved: boolean;
    busy: boolean;

    onKeep: () => void;
    onDelete?: () => void;
    onBlock?: () => void;
};

export default function ModerationCardActions({
    targetType,
    isResolved,
    busy,
    onKeep,
    onDelete,
    onBlock,
}: ModerationCardActionsProps) {
    return (
        <div
            className="flex flex-col gap-2"
            onClick={(event) =>
                event.stopPropagation()
            }
        >
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onKeep}
                isLoading={busy}
                disabled={isResolved}
            >
                Залишити
            </Button>

            {targetType === "users" ? (
                <Button
                    type="button"
                    variant={
                        isResolved
                            ? "outline"
                            : "destructive"
                    }
                    size="sm"
                    onClick={onBlock}
                    isLoading={busy}
                    disabled={isResolved}
                >
                    <Ban className="size-4" />

                    {isResolved
                        ? "Завершено"
                        : "Заблокувати"}
                </Button>
            ) : (
                <Button
                    type="button"
                    variant={
                        isResolved
                            ? "outline"
                            : "destructive"
                    }
                    size="sm"
                    onClick={onDelete}
                    isLoading={busy}
                    disabled={isResolved}
                >
                    <Trash2 className="size-4" />

                    {isResolved
                        ? "Завершено"
                        : "Видалити"}
                </Button>
            )}
        </div>
    );
}