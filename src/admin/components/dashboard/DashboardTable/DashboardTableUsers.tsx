import { useNavigate } from "react-router";

import TableCard from "@/admin/components/dashboard/ui/cards/TableCard.tsx";
import Scroll from "@/admin/components/ui/Scroll.tsx";

import type { AdminUser } from "@/admin/types/users.ts";

type DashboardTableUsersProps = {
    latestUsers: AdminUser[];
};

export default function DashboardTableUsers({
    latestUsers,
}: DashboardTableUsersProps) {
    const navigate = useNavigate();

    return (
        <div className="flex h-full flex-col justify-start">
            <TableCard
                title="Останні реєстрації"
                action={
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/users")
                        }
                        className="cursor-pointer text-sm font-bold text-primary hover:underline"
                    >
                        Усі
                    </button>
                }
            >
                <Scroll className="h-full pr-2">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 z-50 bg-muted text-muted-foreground shadow-[inset_0_-2px_0_0_var(--border)]">
                        <tr className="text-xs font-bold uppercase">
                            <th className="pb-2">
                                Користувач
                            </th>

                            <th className="pb-2 text-right">
                                Час
                            </th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-border text-sm">
                        {latestUsers.map((user) => (
                            <tr
                                key={user.id}
                                onClick={() =>
                                    navigate(`/admin/users/${user.id}`)
                                }
                                className="cursor-pointer transition-colors hover:bg-muted-foreground/10"
                            >
                                <td className="py-3 font-medium">
                                    @{user.username}
                                </td>

                                <td className="py-3 text-right text-muted-foreground">
                                    {new Date(
                                        user.createdAt,
                                    ).toLocaleDateString(
                                        "uk-UA",
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </Scroll>
            </TableCard>
        </div>
    );
}