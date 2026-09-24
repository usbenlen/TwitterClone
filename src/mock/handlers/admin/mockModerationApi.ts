import type {
    ReportDecision,
    ReportSignal,
    ReportStatus,
    ReportTargetType,
} from "@/admin/types/moderation";

import { moderationSignals } from "@/mock/data/admin/moderationSignals";

import {
    commentsByPostId,
} from "@/mock/data/comments";

import {
    sampleAuthors,
} from "@/mock/data/users";

import { tweets } from "@/mock/data/tweets";

const createModerationPostItem = (
    tweetId: string,
): ReportSignal | null => {
    const tweet = tweets.find(
        (item) => item.id === tweetId,
    );

    if (!tweet) {
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

    return signals[0];
};

const createModerationUserItem = (
    userId: string,
): ReportSignal | null => {
    const user = sampleAuthors.find(
        (currentUser) =>
            currentUser.id === userId,
    );

    if (!user) {
        return null;
    }

    const signals = moderationSignals.filter(
        (signal) =>
            signal.targetType === "users" &&
            signal.targetId === userId,
    );

    if (signals.length === 0) {
        return null;
    }

    return signals[0];
};

const getAllComments = () => {
    return Object.values(
        commentsByPostId,
    ).flat();
};

const createModerationCommentItem = (
    commentId: string,
): ReportSignal | null => {
    const comment = getAllComments().find(
        (item) => item.id === commentId,
    );

    if (!comment) {
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

    return signals[0];
};

export const mockModerationApi = {
    async getItems(): Promise<ReportSignal[]> {
        await new Promise((resolve) =>
            setTimeout(resolve, 300),
        );

        const postIds = Array.from(
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

        const userIds = Array.from(
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

        const commentIds = Array.from(
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
            .map(createModerationPostItem)
            .filter(
                (
                    item,
                ): item is ReportSignal =>
                    item !== null,
            );

        const users = userIds
            .map(createModerationUserItem)
            .filter(
                (
                    item,
                ): item is ReportSignal =>
                    item !== null,
            );

        const comments = commentIds
            .map(createModerationCommentItem)
            .filter(
                (
                    item,
                ): item is ReportSignal =>
                    item !== null,
            );

        return [
            ...posts,
            ...users,
            ...comments,
        ];
    },

    async getById(
        reportId: string,
    ): Promise<ReportSignal> {
        await new Promise((resolve) =>
            setTimeout(resolve, 200),
        );

        const signal = moderationSignals.find(
            (currentSignal) =>
                currentSignal.id === reportId,
        );

        if (!signal) {
            throw new Error(
                "Скаргу не знайдено\n",
            );
        }

        return signal;
    },

    async updateStatus(
        targetType: ReportTargetType,
        targetId: string,
        reportStatus: ReportStatus,
        decision?: ReportDecision,
    ): Promise<void> {
        await new Promise((resolve) =>
            setTimeout(resolve, 300),
        );

        moderationSignals.forEach(
            (signal) => {
                if (
                    signal.targetType ===
                    targetType &&
                    signal.targetId === targetId
                ) {
                    signal.status =
                        reportStatus;

                    signal.decision =
                        decision;
                }
            },
        );
    },

    async deletePost(
        postId: string,
    ): Promise<void> {
        await new Promise((resolve) =>
            setTimeout(resolve, 300),
        );

        const index = tweets.findIndex(
            (tweet) => tweet.id === postId,
        );

        if (index === -1) {
            throw new Error(
                "Публікацію не знайдено",
            );
        }

        tweets.splice(index, 1);
    },

    async deleteComment(
        commentId: string,
    ): Promise<void> {
        await new Promise((resolve) =>
            setTimeout(resolve, 300),
        );

        for (const postId of Object.keys(
            commentsByPostId,
        )) {
            const comments =
                commentsByPostId[postId];

            const index = comments.findIndex(
                (comment) =>
                    comment.id === commentId,
            );

            if (index !== -1) {
                comments.splice(index, 1);
                return;
            }
        }

        throw new Error(
            "Коментар не знайдено",
        );
    },

    async blockUser(
        userId: string,
    ): Promise<void> {
        await new Promise((resolve) =>
            setTimeout(resolve, 300),
        );

        const user = sampleAuthors.find(
            (currentUser) =>
                currentUser.id === userId,
        );

        if (!user) {
            throw new Error(
                "Користувача не знайдено",
            );
        }

        user.isBlocked = true;
    },

    async unblockUser(
        userId: string,
    ): Promise<void> {
        await new Promise((resolve) =>
            setTimeout(resolve, 300),
        );

        const user = sampleAuthors.find(
            (currentUser) =>
                currentUser.id === userId,
        );

        if (!user) {
            throw new Error(
                "Користувача не знайдено",
            );
        }

        user.isBlocked = false;
    },

    async deleteUser(
        userId: string,
    ): Promise<void> {
        await new Promise((resolve) =>
            setTimeout(resolve, 300),
        );

        const index = sampleAuthors.findIndex(
            (currentUser) =>
                currentUser.id === userId,
        );

        if (index === -1) {
            throw new Error(
                "Користувача не знайдено",
            );
        }

        sampleAuthors.splice(index, 1);
    },
};