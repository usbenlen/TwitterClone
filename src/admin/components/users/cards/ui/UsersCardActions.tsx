import {
    Ban,
    CheckCircle,
    Trash2,
} from "lucide-react";

import { Button } from "@/ui";

type UsersCardActionsProps = {
    isBlocked: boolean;
    busy: boolean;

    onBlock: () => void;
    onUnblock: () => void;
    onDelete: () => void;
};

export default function UsersCardActions({
    isBlocked,
    busy,
    onBlock,
    onUnblock,
    onDelete,
}: UsersCardActionsProps) {
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
                onClick={
                    isBlocked
                        ? onUnblock
                        : onBlock
                }
                isLoading={busy}
                disabled={busy}
            >
                {isBlocked ? (
                    <CheckCircle className="size-4" />
                ) : (
                    <Ban className="size-4" />
                )}

                {isBlocked
                    ? "Розблокувати"
                    : "Заблокувати"}
            </Button>

            <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDelete}
                isLoading={busy}
                disabled={busy}
            >
                <Trash2 className="size-4" />

                Видалити
            </Button>
        </div>
    );
}