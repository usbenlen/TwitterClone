import type { AdminUser } from "@/admin/types/users";
import type { DashboardReportRow } from "@/admin/types/dashboard";

import { sampleAuthors } from "@/mock/data/users";
import { tweets } from "@/mock/data/tweets";
import { commentsByPostId } from "@/mock/data/comments";
import { moderationSignals } from "@/mock/data/admin/moderationSignals";

const comments = Object.values(commentsByPostId).flat();

const latestUsers = [...sampleAuthors]
    .sort(
        (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

const latestReports = Object.values(
    moderationSignals.reduce<
        Record<string, DashboardReportRow>
    >((groups, signal) => {
        const groupKey = `${signal.targetType}:${signal.targetId}`;

        const existing = groups[groupKey];

        if (!existing) {
            if (signal.targetType === "posts") {
                const target = tweets.find(
                    (item) => item.id === signal.targetId,
                );

                if (!target) {
                    return groups;
                }

                groups[groupKey] = {
                    targetType: "posts",
                    targetId: signal.targetId,
                    count: 1,
                    latestSignal: signal,
                    target,
                };

                return groups;
            }

            if (signal.targetType === "comments") {
                const target = comments.find(
                    (item) => item.id === signal.targetId,
                );

                if (!target) {
                    return groups;
                }

                groups[groupKey] = {
                    targetType: "comments",
                    targetId: signal.targetId,
                    count: 1,
                    latestSignal: signal,
                    target,
                };

                return groups;
            }

            const target = sampleAuthors.find(
                (item) => item.id === signal.targetId,
            );

            if (!target) {
                return groups;
            }

            groups[groupKey] = {
                targetType: "users",
                targetId: signal.targetId,
                count: 1,
                latestSignal: signal,
                target,
            };

            return groups;
        }

        existing.count += 1;

        if (
            new Date(signal.createdAt) >
            new Date(existing.latestSignal.createdAt)
        ) {
            existing.latestSignal = signal;
        }

        return groups;
    }, {}),
)
    .sort(
        (a, b) =>
            new Date(b.latestSignal.createdAt).getTime() -
            new Date(a.latestSignal.createdAt).getTime(),
    )
    .slice(0, 10);

export type DashboardTablesMockData = {
    latestReports: DashboardReportRow[];
    latestUsers: AdminUser[];
};

export const mockDashboardTablesData: DashboardTablesMockData = {
    latestReports,
    latestUsers,
};
