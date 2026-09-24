import { Avatar } from "@/ui";

import { sampleAuthors } from "@/mock/data/users";
import { moderationSignals } from "@/mock/data/admin/moderationSignals";

import type { ReportStatus } from "@/admin/types/moderation";

import ReportCard from "./ReportCard";
import { formatDate } from "@/utils/format.ts";

type ReportUserProps = {
    id: string;
    status?: ReportStatus;
};

const MAX_VISIBLE_REPORTERS = 5;

export default function ReportUserCard({
   id,
}: ReportUserProps) {
    const user = sampleAuthors.find(
        (item) => item.id === id,
    );

    if (!user) {
        return (
            <ReportCard
                title="Користувач"
                openLabel="Відкрити профіль"
                openHref="#"
            >
                <p className="text-sm text-muted-foreground">
                    Користувача не знайдено.
                </p>
            </ReportCard>
        );
    }

    const reports = moderationSignals.filter(
        (signal) =>
            signal.targetType === "users" &&
            signal.targetId === id,
    );

    const uniqueReporters = new Set(
        reports
            .map((report) => report.reporter?.username)
            .filter(Boolean),
    ).size;

    const groupedReports = Object.values(
        reports.reduce<
            Record<
                string,
                {
                    reason: string;
                    count: number;
                    reporters: string[];
                }
            >
        >((groups, report) => {
            const key = report.reason;

            if (!groups[key]) {
                groups[key] = {
                    reason: report.reasonLabel,
                    count: 0,
                    reporters: [],
                };
            }

            groups[key].count += 1;

            if (report.reporter) {
                const username =
                    report.reporter.username;

                if (
                    !groups[key].reporters.includes(
                        username,
                    )
                ) {
                    groups[key].reporters.push(
                        username,
                    );
                }
            }

            return groups;
        }, {}),
    );

    return (
        <div className="grid gap-6">
            <ReportCard
                title="Користувач"
                openLabel="Відкрити профіль"
                openHref={`/${user.username}`}
            >
                <div className="flex items-start gap-4">
                    <Avatar
                        src={user.avatarUrl}
                        name={user.displayName}
                        fallbackName={user.username}
                        className="size-16 shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold">
                            {user.displayName}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                            @{user.username}
                        </p>

                        {user.bio && (
                            <p className="mt-3 text-sm text-foreground">
                                {user.bio}
                            </p>
                        )}
                    </div>

                    <div className="hidden shrink-0 text-right sm:block">
                        <p className="text-xs text-muted-foreground">
                            Реєстрація
                        </p>

                        <p className="mt-1 text-sm font-medium">
                            {formatDate(user.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex gap-8 border-t border-border pt-4">
                    <div>
                        <p className="font-semibold">
                            {user.postsCount}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            публікацій
                        </p>
                    </div>

                    <div>
                        <p className="font-semibold">
                            {user.followersCount}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            підписників
                        </p>
                    </div>

                    <div>
                        <p className="font-semibold">
                            {user.followingCount}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            підписок
                        </p>
                    </div>
                </div>
            </ReportCard>

            <ReportCard
                title="Скарги"
                openLabel=""
                openHref=""
            >
                {reports.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Скарг нема.
                    </p>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            {reports.length} скарг ·{" "}
                            {uniqueReporters} користувачів
                        </p>

                        <div className="mt-5 grid gap-5">
                            {groupedReports.map(
                                ({
                                     reason,
                                     count,
                                     reporters,
                                 }) => {
                                    const visible =
                                        reporters.slice(
                                            0,
                                            MAX_VISIBLE_REPORTERS,
                                        );

                                    const remaining =
                                        reporters.length -
                                        visible.length;

                                    return (
                                        <div key={reason}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {reason}
                                                </span>

                                                <span className="text-sm text-muted-foreground">
                                                    ·
                                                </span>

                                                <span className="text-sm font-semibold">
                                                    {count}
                                                </span>
                                            </div>

                                            {visible.length >
                                                0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {visible.map(
                                                            (
                                                                username,
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        username
                                                                    }
                                                                    className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                                                                >
                                                                @{username}
                                                            </span>
                                                            ),
                                                        )}

                                                        {remaining >
                                                            0 && (
                                                                <span className="px-1 py-1 text-xs text-muted-foreground">
                                                            +{" "}
                                                                    {
                                                                        remaining
                                                                    }{" "}
                                                                    інших
                                                        </span>
                                                            )}
                                                    </div>
                                                )}
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </>
                )}
            </ReportCard>
        </div>
    );
}