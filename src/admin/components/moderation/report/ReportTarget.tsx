import type { ModerationStatus } from "@/admin/types/moderation";

import { ReportPostCard } from "./cards/ReportPostCard.tsx";
import { ReportCommentCard } from "./cards/ReportCommentCard.tsx";
import { ReportUserCard } from "./cards/ReportUserCard.tsx";

type Props = {
    target: {
        type: "posts" | "comments" | "users";
        id: string;
    };
    status?: ModerationStatus;
};

export function ReportTarget({
    target,
    status,
}: Props) {
    switch (target.type) {
        case "posts":
            return (
                <ReportPostCard
                    id={target.id}
                    status={status}
                />
            );

        case "comments":
            return (
                <ReportCommentCard
                    id={target.id}
                    status={status}
                />
            );

        case "users":
            return (
                <ReportUserCard
                    id={target.id}
                    status={status}
                />
            );

        default:
            return null;
    }
}