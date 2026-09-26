import { useState } from "react";
import { Check, X, CheckCircle2 } from "lucide-react";

import { Button } from "@/ui";

type ReportReason =
    | "spam"
    | "harassment"
    | "misinformation"
    | "violence"
    | "hate"
    | "other";

type ReportModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
};

const REPORT_REASONS: {
    value: ReportReason;
    label: string;
    description: string;
}[] = [
    {
        value: "spam",
        label: "Спам",
        description: "Небажаний або повторюваний контент",
    },
    {
        value: "harassment",
        label: "Образи або переслідування",
        description: "Нападки, погрози або небажане поводження",
    },
    {
        value: "misinformation",
        label: "Недостовірна інформація",
        description: "Недостовірна або оманлива інформація",
    },
    {
        value: "violence",
        label: "Насильство",
        description: "Погрози або контент, пов’язаний із насильством",
    },
    {
        value: "hate",
        label: "Мова ворожнечі",
        description: "Образи або нападки на людей через їхню належність до певної групи",
    },
    {
        value: "other",
        label: "Інше",
        description: "Причина, яка не підходить під наведені категорії",
    },
];

export default function ReportModal({
                                        open,
                                        onClose,
                                        onSubmit,
                                    }: ReportModalProps) {
    const [selectedReason, setSelectedReason] =
        useState<ReportReason | null>(null);

    const [isSubmitted, setIsSubmitted] =
        useState(false);

    if (!open) {
        return null;
    }

    const handleClose = () => {
        setSelectedReason(null);
        setIsSubmitted(false);
        onClose();
    };

    const handleSubmit = () => {
        onSubmit();
        setIsSubmitted(true);
    };

    return (
        <div
            className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            >
                <header className="flex h-14 items-center border-b border-border px-4">
                    <div className="w-9" />

                    <h2 className="flex-1 text-center text-base font-bold">
                        Поскаржитися
                    </h2>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="ml-3 cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Закрити"
                    >
                        <X className="size-5" />
                    </button>
                </header>

                {isSubmitted ? (
                    <div className="p-6 text-center">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CheckCircle2 className="size-9" />
                        </div>

                        <h3 className="mt-5 text-xl font-bold">
                            Скаргу надіслано
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Ми розглянемо вашу скаргу та вживемо відповідних заходів, якщо це буде необхідно.
                        </p>

                        <Button
                            type="button"
                            className="mt-6 w-full"
                            onClick={handleClose}
                        >
                            Готово
                        </Button>
                    </div>
                ) : (
                    <div className="p-5">
                        <div>
                            <h3 className="text-xl font-bold">
                                Що вас турбує?
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Оберіть причину скарги.
                            </p>
                        </div>

                        <div className="mt-5 space-y-1">
                            {REPORT_REASONS.map((reason) => {
                                const isSelected =
                                    selectedReason === reason.value;

                                return (
                                    <button
                                        key={reason.value}
                                        type="button"
                                        onClick={() =>
                                            setSelectedReason(
                                                reason.value,
                                            )
                                        }
                                        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                                            isSelected
                                                ? "bg-primary/10"
                                                : "hover:bg-muted"
                                        }`}
                                    >
                                        <span
                                            className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                                                isSelected
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-muted-foreground/40"
                                            }`}
                                        >
                                            {isSelected && (
                                                <Check className="size-3.5" />
                                            )}
                                        </span>

                                        <span className="min-w-0">
                                            <span className="block text-sm font-semibold">
                                                {reason.label}
                                            </span>

                                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                                {reason.description}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <Button
                            type="button"
                            variant="destructive"
                            className="mt-5 w-full"
                            disabled={!selectedReason}
                            onClick={handleSubmit}
                        >
                            Надіслати скаргу
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}