type ModerationCardSignal = {
    label: string;
    count: number;
};

type ModerationCardSignalsProps = {
    signals: ModerationCardSignal[];
};

export default function ModerationCardSignals({
    signals,
}: ModerationCardSignalsProps) {
    if (signals.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {signals.map(
                ({ label, count }) => (
                    <span
                        key={label}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                        {label}

                        {count > 1 &&
                            ` ×${count}`}
                    </span>
                ),
            )}
        </div>
    );
}
