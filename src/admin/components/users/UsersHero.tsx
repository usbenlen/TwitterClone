type UsersHeroProps = {
    count: number;
};

export default function UsersHero({
    count,
}: UsersHeroProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Список користувачів
                </h2>

                 <p className="mt-1 text-sm text-muted-foreground">
                     Перегляд користувачів та керування їхнім статусом.
                </p>
            </div>

             <div className="text-sm text-muted-foreground">
                Знайдено: {count}
            </div>
        </div>
    );
}