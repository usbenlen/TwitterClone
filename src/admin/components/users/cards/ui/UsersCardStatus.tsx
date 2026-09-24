type UserCardStatusProps = {
    isBlocked: boolean;
    // isDeleted: boolean;
};

export default function UsersCardStatus({
   isBlocked,
}: UserCardStatusProps) {
    return (
        <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
                Статус:
            </span>

            <span
                className={
                    isBlocked
                        ? "text-sm font-semibold text-destructive"
                        : "text-sm font-semibold text-foreground"
                }
            >
                {isBlocked
                    ? "Заблокований"
                    : "Активний"
                }
            </span>
        </div>
    );
}