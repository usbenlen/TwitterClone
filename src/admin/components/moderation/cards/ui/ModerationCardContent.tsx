import type { ReportTargetType } from "@/admin/types/moderation";

type ModerationCardContentProps = {
    targetType: ReportTargetType;
    content?: string;
};

export default function ModerationCardContent({
    targetType,
    content,
}: ModerationCardContentProps) {
    if (
        targetType === "comments" ||
        targetType === "posts"
    ) {
        return (
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                {content}
            </p>
        );
    }

    return null;
}
