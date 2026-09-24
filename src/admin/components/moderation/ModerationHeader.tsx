type ModerationHeroProps = {
    count: number;
};

export default function ModerationHeader({
    count,
}: ModerationHeroProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Єдина черга модерації
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Користувачі, публікації та коментарі, які потребують уваги модератора.
                </p>
            </div>

            <div className="text-sm text-muted-foreground">
                Знайдено: {count}
            </div>
        </div>
    );
}