import type { User } from "@/types/user";
import UsersCard from "@/admin/components/users/cards/UsersCard.tsx";

type UsersListProps = {
    items: User[];

    onOpen: (userId: string) => void;
    onBlock: (user: User) => Promise<void>;
    onUnblock: (user: User) => Promise<void>;
    onDelete: (user: User) => Promise<void>;
};

export default function UsersList({
    items,
    onOpen,
    onBlock,
    onUnblock,
    onDelete,
}: UsersListProps) {
    return (
        <div className="w-full">
            <div className="pb-4 pl-4 pr-4 pt-2">
                <div className="grid w-full grid-cols-[minmax(0,1fr)_17rem] items-center gap-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Користувач
                    </div>

                    <div className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Дії
                    </div>
                </div>
            </div>

            <div className="relative w-full">
                <div className="pointer-events-none absolute inset-y-0 z-10" />

                {items.map((user) => (
                    <UsersCard
                        key={user.id}
                        user={user}
                        onOpen={() => onOpen(user.id)}
                        onBlock={() => onBlock(user)}
                        onUnblock={() => onUnblock(user)}
                        onDelete={() => onDelete(user)}
                    />
                ))}

                {items.length === 0 && (
                    <div className="p-10 text-center">
                        <p className="text-sm font-medium text-foreground">
                            Користувачів не знайдено
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Спробуйте змінити пошуковий запит.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}