import type { ReportStatus } from "@/admin/types/moderation.ts";

import {
    ReportPostCard,
    ReportCommentCard,
    ReportUserCard,
} from "@/admin/components/moderation/report/cards";

type Props = {
    target: {
        type: "posts" | "comments" | "users";
        id: string;
    };
    status?: ReportStatus;
};

export default function ReportTarget({
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