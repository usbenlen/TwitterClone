import type { ChangeEvent } from "react";

type SearchInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export default function Input({
    value,
    onChange,
    placeholder = "Пошук...",
}: SearchInputProps) {
    const handleChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        onChange(event.target.value);
    };

    return (
        <div
            className={`w-full`}
        >
            <input
                type="search"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="
                    h-10 w-full min-w-[180px]
                    rounded-full
                    border border-border
                    bg-background
                    px-4
                    text-sm font-medium
                    text-foreground
                    outline-none

                    transition-all duration-200 ease-out

                    placeholder:text-muted-foreground

                    hover:bg-muted/50

                    focus:border-primary
                    focus:bg-background
                    focus:text-foreground
                    focus:ring-2
                    focus:ring-primary/25
                "
            />
        </div>
    );
}