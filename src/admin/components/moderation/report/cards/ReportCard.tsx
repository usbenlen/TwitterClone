import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

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
                    <a
                        href={openHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {openLabel}

                        <ExternalLink className="size-4" />
                    </a>
                )}
            </div>

            <div className="p-4">
                {children}
            </div>
        </section>
    );
}