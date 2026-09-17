import type { Tweet } from "@/types";

export function getAttachmentDescription(
    tweet: Tweet,
): string | null {
    if (
        !tweet.attachments ||
        tweet.attachments.length === 0
    ) {
        return null;
    }

    const imageCount = tweet.attachments.filter(
        (attachment) =>
            attachment.type === "image").length;

    const videoCount = tweet.attachments.filter(
        (attachment) =>
            attachment.type === "video").length;

    const parts: string[] = [];

    if (imageCount > 0) {
        parts.push(
            `${imageCount} ${
                imageCount === 1
                    ? "зображення"
                    : imageCount < 5
                        ? "зображення"
                        : "зображень"
            }`,
        );
    }

    if (videoCount > 0) {
        parts.push(`${videoCount} відео`);
    }

    if (tweet.poll) {
        const count = tweet.poll.options.length;

        parts.push(
            `опрос (${count} ${
                count === 1
                    ? "варіант"
                    : count < 5
                        ? "варіанта"
                        : "варіантів"
            })`,
        );
    }

    return parts.length > 0 ? `Вкладення: ${parts.join(", ")}` : null;
}
