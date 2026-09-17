import type { ReactNode } from "react";

type TableCardProps = {
    title: string;
    children: ReactNode;
    action?: ReactNode;
};

export default function TableCard({
    title,
    children,
    action,
}: TableCardProps) {
    return (
        <div className="flex h-80 flex-col rounded-xl border border-slate-200 bg-muted p-5">
            <div className="mb-4 flex justify-between border-b-2 border-border border-primary pb-2">
                <h3 className="text-base font-semibold">
                    {title}
                </h3>

                {action && <div>{action}</div>}
            </div>

            <div className="min-h-0 flex-1">
                {children}
            </div>
        </div>
    );
}