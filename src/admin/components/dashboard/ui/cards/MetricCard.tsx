import type { ReactNode } from "react";

export type MetricTrendType =
    | "positive"
    | "negative";

type MetricCardProps = {
    title: string;
    value: string;
    trend?: string;
    trendType?: MetricTrendType;
    trendText?: string;
    icon?: ReactNode;
};

export default function MetricCard({
   title,
   value,
   icon,
}: MetricCardProps) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-muted p-5">
            {icon && (
                <div className="absolute right-5 top-5 text-muted-foreground">
                    {icon}
                </div>
            )}

            <div className="relative z-10">
                <div className="text-sm font-medium text-muted-foreground">
                    {title}
                </div>

                <div className="mt-2 text-3xl font-bold tracking-tight">
                    {value}
                </div>
            </div>
        </div>
    );
}