import type { AdminUser } from "@/admin/types/users";
import type { ReportSignal } from "@/admin/types/moderation";
import type { Tweet } from "@/types";

import { sampleAuthors } from "@/mock/data/users";
import { tweets } from "@/mock/data/tweets";
import { moderationSignals } from "@/mock/data/admin/moderationSignals";

export type DashboardReportRow = {
    reportId: string;
    targetId: string;
    count: number;
    latestSignal: ReportSignal;
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
    .slice(0, 10);

const latestReports = Object.values(
    moderationSignals.reduce<
        Record<string, DashboardReportRow>
    >((groups, signal) => {
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
                reportId: signal.id,
                targetId: signal.targetId,
                count: 1,
                latestSignal: signal,
                tweet,
            };

            return groups;
        }

        existing.count += 1;

        if (
            new Date(signal.createdAt) >
            new Date(existing.latestSignal.createdAt)
        ) {
            existing.latestSignal = signal;
            existing.reportId = signal.id;
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
    .slice(0, 10);

export const mockDashboardTablesData: DashboardTablesMockData = {latestReports, latestUsers};
