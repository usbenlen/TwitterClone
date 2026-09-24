import { commentsByPostId } from "@/mock/data/comments.ts";
import { tweets } from "@/mock/data/tweets.ts";
import { moderationSignals } from "@/mock/data/admin/moderationSignals.ts";

export const mockReportApi = {
    async getComment(commentId: string) {
        const comment = Object.values(commentsByPostId)
            .flat()
            .find(
                (item) => item.id === commentId,
            );

        if (!comment) {
            throw new Error(
                "Коментар не знайдено",
            );
        }

        return comment;
    },

    async getPost(postId: string) {
        const post = tweets.find(
            (tweet) => tweet.id === postId,
        );

        if (!post) {
            throw new Error(
                "Пост не знайдено",
            );
        }

        return post;
    },

    async getSignals(
        targetType: "comments" | "posts" | "users",
        targetId: string,
    ) {
        return moderationSignals.filter(
            (signal) =>
                signal.targetType === targetType &&
                signal.targetId === targetId,
        );
    },
};