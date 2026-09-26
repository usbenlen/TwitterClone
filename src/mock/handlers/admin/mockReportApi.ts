import type {
    ReportReason,
    ReportTargetType,
} from "@/admin/types/moderation";

export const mockReportApi = {
    async report(
        targetType: ReportTargetType,
        targetId: string,
        reason: ReportReason,
    ): Promise<void> {
        void targetType;
        void targetId;
        void reason;
    },
};