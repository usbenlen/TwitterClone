import type { Tweet } from "@/types";
import type {
    ModerationItem,
    ModerationSignal,
    ModerationStatus,
} from "@/admin/types/moderation";

import { moderationSignals } from "@/mock/data/admin/moderationSignals";
import { moderationStatuses } from "@/mock/data/admin/moderationStatuses";

import {
    commentsByPostId,
} from "@/mock/data/comments";
import {
    sampleAuthors,
} from "@/mock/data/users";
import { tweets } from "@/mock/data/tweets";

import { mockAdminTweetApi } from "@/mock/handlers/admin/mockAdminTweetApi";

type ModerationTargetType =
    | "posts"
    | "users"
    | "comments";

const getPriority = (
    signalsCount: number,
) => {
    if (signalsCount >= 5) {
        return {
            priority: "critical" as const,
            priorityLabel: "Критичний",
        };
    }

    if (signalsCount >= 3) {
        return {
            priority: "high" as const,
            priorityLabel: "Високий",
        };
    }

    if (signalsCount >= 2) {
        return {
            priority: "medium" as const,
            priorityLabel: "Середній",
        };
    }

    return {
        priority: "low" as const,
        priorityLabel: "Низький",
    };
};

const getSignalMeta = (
    signals: ModerationSignal[],
) => {
    const hasSystemSignals = signals.some(
        (signal) =>
            signal.source === "system",
    );

    const hasUserSignals = signals.some(
        (signal) =>
            signal.source === "user",
    );

    if (
        hasSystemSignals &&
        hasUserSignals
    ) {
        return {
            signalType: "synergy" as const,
            signalLabel:
                "Сигнали користувачів і системи",
            signalDescription:
                "На об'єкт модерації надійшли сигнали від користувачів та автоматичної системи.",
        };
    }

    if (hasSystemSignals) {
        return {
            signalType: "system" as const,
            signalLabel: "Сигнал системи",
            signalDescription:
                "Об'єкт модерації був позначений автоматичною системою.",
        };
    }

    return {
        signalType: "users" as const,
        signalLabel:
            "Сигнали користувачів",
        signalDescription:
            "На об'єкт модерації надійшли сигнали від користувачів.",
    };
};

const createModerationMeta = (
    signals: ModerationSignal[],
) => {
    const {
        priority,
        priorityLabel,
    } = getPriority(signals.length);

    const {
        signalType,
        signalLabel,
        signalDescription,
    } = getSignalMeta(signals);

    return {
        signalType,
        signalLabel,
        signalDescription,
        priority,
        priorityLabel,
    };
};

const createModerationPostItem = (
    tweetId: string,
): Extract<
    ModerationItem,
    { type: "posts" }
> | null => {
    const tweet = tweets.find(
        (item) => item.id === tweetId,
    );

    if (!tweet) {
        return null;
    }

    const status =
        moderationStatuses[`posts:${tweet.id}`] ?? "pending";

    if (status !== "pending") {
        return null;
    }

    const signals = moderationSignals.filter(
        (signal) =>
            signal.targetType === "posts" &&
            signal.targetId === tweet.id,
    );

    if (signals.length === 0) {
        return null;
    }

    return {
        type: "posts",
        id: tweet.id,
        subject: tweet,
        signals,
        status,
        meta: createModerationMeta(signals),
    };
};

const createModerationUserItem = (
    userId: string,
): ModerationItem | null => {
    const user = sampleAuthors.find(
        (currentUser) => currentUser.id === userId,
    );

    if (!user) {
        return null;
    }

    const signals = moderationSignals.filter(
        (signal) => signal.targetId === userId,
    );

    if (signals.length === 0) {
        return null;
    }

    const status =
        moderationStatuses[`users:${user.id}`] ?? "pending";

    return {
        type: "users",
        id: user.id,
        subject: user,
        signals,
        status,
        meta: createModerationMeta(signals),
    };
};

const getAllComments = () => {
    return Object.values(
        commentsByPostId,
    ).flat();
};

const createModerationCommentItem = (
    commentId: string,
): Extract<
    ModerationItem,
    { type: "comments" }
> | null => {
    const comment = getAllComments().find(
        (item) => item.id === commentId,
    );

    if (!comment) {
        return null;
    }

    const status =
        moderationStatuses[
            `comments:${comment.id}`
        ] ?? "pending";

    if (status !== "pending") {
        return null;
    }

    const signals = moderationSignals.filter(
        (signal) =>
            signal.targetType === "comments" &&
            signal.targetId === comment.id,
    );

    if (signals.length === 0) {
        return null;
    }

    return {
        type: "comments",
        id: comment.id,
        subject: comment,
        signals,
        status,
        meta: createModerationMeta(signals),
    };
};

export const mockAdminModerationApi = {
    async getItems(): Promise<
        ModerationItem[]
    > {
        await new Promise((resolve) =>
            setTimeout(resolve, 300),
        );

        const postIds =
            Array.from(
                new Set(
                    moderationSignals
                        .filter(
                            (signal) =>
                                signal.targetType ===
                                "posts",
                        )
                        .map(
                            (signal) =>
                                signal.targetId,
                        ),
                ),
            );

        const userIds =
            Array.from(
                new Set(
                    moderationSignals
                        .filter(
                            (signal) =>
                                signal.targetType ===
                                "users",
                        )
                        .map(
                            (signal) =>
                                signal.targetId,
                        ),
                ),
            );

        const commentIds =
            Array.from(
                new Set(
                    moderationSignals
                        .filter(
                            (signal) =>
                                signal.targetType ===
                                "comments",
                        )
                        .map(
                            (signal) =>
                                signal.targetId,
                        ),
                ),
            );

        const posts = postIds
            .map(
                createModerationPostItem,
            )
            .filter(
                (
                    item,
                ): item is Extract<
                    ModerationItem,
                    { type: "posts" }
                > =>
                    item !== null,
            );

        const users = userIds
            .map(
                createModerationUserItem,
            )
            .filter(
                (
                    item,
                ): item is Extract<
                    ModerationItem,
                    { type: "users" }
                > =>
                    item !== null,
            );

        const comments = commentIds
            .map(
                createModerationCommentItem,
            )
            .filter(
                (
                    item,
                ): item is Extract<
                    ModerationItem,
                    { type: "comments" }
                > =>
                    item !== null,
            );

        return [
            ...posts,
            ...users,
            ...comments,
        ];
    },

    async getSignals(
        targetType: ModerationTargetType,
        targetId: string,
    ): Promise<
        ModerationSignal[]
    > {
        await new Promise((resolve) =>
            setTimeout(resolve, 200),
        );

        return moderationSignals.filter(
            (signal) =>
                signal.targetType ===
                targetType &&
                signal.targetId ===
                targetId,
        );
    },

    async toggleDelete(
        tweetId: string,
        isDeleted: boolean,
    ): Promise<Tweet> {
        return mockAdminTweetApi.toggleDelete(
            tweetId,
            isDeleted,
        );
    },

    async updateStatus(
        targetType: ModerationTargetType,
        targetId: string,
        status: ModerationStatus,
    ): Promise<void> {
        await new Promise((resolve) =>
            setTimeout(resolve, 300),
        );

        const key = `${targetType}:${targetId}`;

        moderationStatuses[key] = status;
    },
};