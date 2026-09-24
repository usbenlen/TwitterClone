import { useEffect, useRef, useState } from "react";
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
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(
        (option) => option.value === value,
    );

    const selectedLabel =
        selectedOption?.label ?? "Оберіть статус";

    useEffect(() => {
        const handleOtherSelectOpen = (
            event: Event,
        ) => {
            const customEvent =
                event as CustomEvent<HTMLDivElement | null>;

            if (
                customEvent.detail !==
                selectRef.current
            ) {
                setIsOpen(false);
            }
        };

        window.addEventListener(
            "select:open",
            handleOtherSelectOpen,
        );

        return () => {
            window.removeEventListener(
                "select:open",
                handleOtherSelectOpen,
            );
        };
    }, []);

    useEffect(() => {
        const handleMouseDown = (
            event: MouseEvent,
        ) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(
                    event.target as Node,
                )
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleMouseDown,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleMouseDown,
            );
        };
    }, []);

    const handleToggle = () => {
        setIsOpen((current) => {
            const next = !current;

            if (next) {
                window.dispatchEvent(
                    new CustomEvent("select:open", {
                        detail: selectRef.current,
                    }),
                );
            }

            return next;
        });
    };

    return (
        <div
            ref={selectRef}
            className="relative z-50 w-full lg:w-auto"
        >
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
                <div className="absolute left-0 top-full z-[60] mt-2 min-w-full rounded-2xl border border-border bg-card p-2 shadow-xl">
                    <div className="flex w-full flex-col gap-1">
                        {options.map((option) => {
                            const isActive =
                                option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(
                                            option.value,
                                        );
                                        setIsOpen(false);
                                    }}
                                    className={`block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors ${
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