import type { AdminUser } from "@/admin/types/users";
import type { ModerationSignal } from "@/admin/components/moderation/types";
import type { Tweet } from "@/types";

import { sampleAuthors } from "@/mock/data/users";
import { tweets } from "@/mock/data/tweets";
import { moderationSignals } from "@/mock/data/admin/moderationSignals";

export type DashboardReportRow = {
    targetId: string;
    count: number;
    latestSignal: ModerationSignal;
    tweet: Tweet;
};

export type DashboardTablesMockData = {
    latestReports: DashboardReportRow[];
    latestUsers: AdminUser[];
};

const latestUsers = [...sampleAuthors]
    .sort(
        (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

const latestReports = Object.values(
    moderationSignals.reduce<
        Record<string, DashboardReportRow>
    >((groups, signal) => {
        // Берём только жалобы на публикации
        if (
            signal.targetType !== "posts" ||
            signal.source !== "user"
        ) {
            return groups;
        }

        const tweet = tweets.find(
            (item) => item.id === signal.targetId,
        );

        if (!tweet) {
            return groups;
        }

        const existing = groups[signal.targetId];

        if (!existing) {
            groups[signal.targetId] = {
                targetId: signal.targetId,
                count: 1,
                latestSignal: signal,
                tweet,
            };

            return groups;
        }

        existing.count += 1;

        if (
            new Date(signal.createdAt).getTime() >
            new Date(
                existing.latestSignal.createdAt,
            ).getTime()
        ) {
            existing.latestSignal = signal;
        }

        return groups;
    }, {}),
)
    .sort(
        (a, b) =>
            new Date(
                b.latestSignal.createdAt,
            ).getTime() -
            new Date(
                a.latestSignal.createdAt,
            ).getTime(),
    )
    .slice(0, 5);

export const mockDashboardTablesData: DashboardTablesMockData = {
    latestReports,
    latestUsers,
};
