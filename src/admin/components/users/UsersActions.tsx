import {
    Ban,
    CheckCircle,
    Trash2,
} from "lucide-react";

import { Button } from "@/ui";

type UsersActionsProps = {
    isBlocked: boolean;
    busy?: boolean;

    onBlock: () => void;
    onUnblock: () => void;
    onDelete: () => void;
};

export default function UsersActions({
    isBlocked,
    busy = false,
    onBlock,
    onUnblock,
    onDelete,
}: UsersActionsProps) {
    const handleBlock = () => {
        if (isBlocked) {
            onUnblock();
            return;
        }

        onBlock();
    };

    return (
        <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-lg font-semibold">
                    Дії
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Керування обліковим записом користувача.
                </p>

                <div className="mt-5 space-y-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleBlock}
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
                        className="w-full justify-start"
                        onClick={onDelete}
                        isLoading={busy}
                        disabled={busy}
                    >
                        <Trash2 className="size-4" />

                        Видалити
                    </Button>
                </div>

                <div className="mt-5 border-t border-border pt-5">
                    <div className="flex items-center gap-1 flex-row">

                    <span className="text-sm font-semibold text-muted-foreground">
                        Статус:
                    </span>

                    <p
                        className={
                            isBlocked
                                ? "text-sm font-semibold text-destructive"
                                : "text-sm font-semibold text-foreground"
                        }
                    >
                        {isBlocked
                            ? "Заблокований"
                            : "Активний"}
                    </p>

                    </div>
                </div>
            </section>
        </aside>
    );
}