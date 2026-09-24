import type { ReactNode } from "react";
import { OriginLink } from "@/admin/components/moderation/report/cards/ui";

type ReportCardProps = {
    title: string;
    openLabel?: string;
    openHref?: string;
    children: ReactNode;
};

export default function ReportCard({
   title,
   openLabel,
   openHref,
   children,
}: ReportCardProps) {
    return (
        <section className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-lg font-semibold">
                    {title}
                </h2>

                {openLabel && openHref && (
                    <OriginLink
                        label={openLabel}
                        href={openHref}
                    />
                )}
            </div>

            <div className="p-4">
                {children}
            </div>
        </section>
    );
}