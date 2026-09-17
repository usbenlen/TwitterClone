import { Avatar } from "@/ui";
import { formatFullDate } from "@/utils/format.ts";

type ModerationCardHeaderProps = {
    avatarUrl?: string | null;
    displayName?: string | null;
    username: string;
    typeLabel: string;
    createdAt?: string | null;
};

export default function ModerationCardHeader({
    avatarUrl,
    displayName,
    username,
    typeLabel,
    createdAt,
}: ModerationCardHeaderProps) {
    return (
        <div className="flex items-center gap-3">
            <Avatar
                src={avatarUrl}
                name={displayName}
                fallbackName={username}
            />

            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-foreground">
                        {displayName ?? username}
                    </span>

                    <span className="text-sm text-muted-foreground">
                        @{username}
                    </span>

                    <span
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                        {typeLabel}
                    </span>

                    {createdAt && (
                        <span className="text-sm text-muted-foreground">
                            {formatFullDate(createdAt)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
