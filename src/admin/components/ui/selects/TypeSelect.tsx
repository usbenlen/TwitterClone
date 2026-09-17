import { useState } from "react";
import { ChevronDown } from "lucide-react";

type ContentType =
    | "all"
    | "posts"
    | "comments";

const options: {
    value: ContentType;
    label: string;
}[] = [
    { value: "all", label: "Усі" },
    { value: "posts", label: "Публікації" },
    { value: "comments", label: "Коментарі" },
];

export default function TypeSelect({
  value,
  onChange,
}: {
    value: ContentType;
    onChange: (value: ContentType) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const selected = options.find(
        (option) => option.value === value,
    );

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="
                    flex items-center gap-1.5
                    text-sm font-medium
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                    focus:outline-none
                "
            >
                <span>Тип контенту:</span>

                <span
                    className={
                        isOpen
                            ? "text-primary"
                            : "text-foreground"
                    }
                >
                    {selected?.label}
                </span>

                <ChevronDown
                    className={`size-3.5 transition-transform duration-200 ${
                        isOpen
                            ? "rotate-180 text-primary" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute right-0 top-full z-50 mt-2 flex w-40 flex-col gap-1 rounded-2xl border border-border bg-card p-1.5 shadow-xl">
                        {options.map((option) => {
                            const isActive =
                                value === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`flex w-full gap-1 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
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
                </>
            )}
        </div>
    );
}