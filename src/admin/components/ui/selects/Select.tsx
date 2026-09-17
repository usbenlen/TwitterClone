import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

type SelectOption = {
    value: string;
    label: string;
};

type SelectProps = {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
};

export default function Select({
   value,
   onChange,
   options,
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleClose = () => {
            setIsOpen(false);
        };

        window.addEventListener("close-all-selects", handleClose);

        return () => {
            window.removeEventListener(
                "close-all-selects",
                handleClose,
            );
        };
    }, []);

    const handleToggle = () => {
        if (!isOpen) {
            window.dispatchEvent(
                new Event("close-all-selects"),
            );
        }

        setIsOpen((current) => !current);
    };

    const selectedOption = options.find(
        (option) => option.value === value,
    );

    const selectedLabel =
        selectedOption?.label ?? "Оберіть статус";

    return (
        <div className="relative z-50 w-full lg:w-auto">
            <button
                type="button"
                onClick={handleToggle}
                className="
                    flex
                    h-10
                    w-full
                    items-center
                    justify-between
                    rounded-full
                    border
                    border-border
                    bg-background
                    px-4
                    text-sm
                    font-medium
                    transition
                    hover:bg-muted/50
                    focus:outline-none
                    focus:ring-2
                    focus:ring-primary/25
                    lg:w-auto
                "
            >
                <span
                    className={`truncate pr-3 ${
                        isOpen
                            ? "text-primary"
                            : "text-foreground"
                    }`}
                >
                    {selectedLabel}
                </span>

                <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen
                            ? "rotate-180 text-primary"
                            : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 min-w-full rounded-2xl border border-border bg-card p-2 shadow-xl">
                    <div className="flex flex-col gap-1">
                        {options.map((option) => {
                            const isActive =
                                option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                        isActive
                                            ? "bg-primary/10 font-medium text-primary"
                                            : "text-foreground hover:bg-muted"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}