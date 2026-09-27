import type { ReactNode } from "react";

type ChartCardProps = {
    title: string;
    children: ReactNode;
    action?: ReactNode;
};

export default function ChartCard({
  children,
  action,
}: ChartCardProps) {
    return (
        <div className="rounded-2xl border border-border bg-muted">
            <div className="flex items-center justify-between ">
                {action && (
                    <div className="shrink-0">
                        {action}
                    </div>
                )}
            </div>

            <div className="p-4">
                {children}
            </div>
        </div>
    );
}