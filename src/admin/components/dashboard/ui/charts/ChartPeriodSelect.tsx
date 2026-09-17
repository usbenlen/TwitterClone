import type { AnalyticsPeriod } from "@/admin/types/analytics.ts";
import { periodLabels } from "@/admin/constants/dashboardChart.ts";

type ChartPeriodSelectProps = {
    value: AnalyticsPeriod;
    onChange: (
        value: AnalyticsPeriod,
    ) => void;
};

export default function ChartPeriodSelect({
    value,
    onChange,
}: ChartPeriodSelectProps) {
    return (
        <div className="flex w-full overflow-x-auto rounded-xl border border-border bg-muted p-1 sm:w-auto">
            {(
                Object.keys(
                    periodLabels,
                ) as AnalyticsPeriod[]
            ).map((item) => (
                <button
                    key={item}
                    type="button"
                    onClick={() => onChange(item)}
                    aria-pressed={value === item}
                    className={[
                        "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        value === item
                            ? "bg-background text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                >
                    {periodLabels[item]}
                </button>
            ))}
        </div>
    );
}
