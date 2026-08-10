/** @format */

import { useRef, useState } from "react";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export default function CodeInput({
  value,
  onChange,
  length = 6,
  disabled = false,
}: CodeInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  const focusInput = (index: number) => {
    if (index < 0 || index >= length) return;

    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
    setFocusedIndex(index);
  };

  const updateValue = (nextDigits: string[]) => {
    onChange(nextDigits.join("").slice(0, length));
  };

  const handleChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.target.value;

    if (!input) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      updateValue(nextDigits);
      return;
    }

    // Якщо вставили декілька символів - обробляємо як код
    const pastedDigits = input.replace(/\D/g, "");

    if (pastedDigits.length > 1) {
      const nextDigits = Array.from({ length }, (_, i) => {
        return pastedDigits[i] ?? "";
      });

      updateValue(nextDigits);

      const nextIndex = Math.min(pastedDigits.length, length - 1);
      focusInput(nextIndex);

      return;
    }

    const digit = pastedDigits[0];

    if (!digit) return;

    const nextDigits = [...digits];
    nextDigits[index] = digit;

    updateValue(nextDigits);

    if (index < length - 1) focusInput(index + 1);
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = "";
        updateValue(nextDigits);
        return;
      }

      if (index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        updateValue(nextDigits);

        focusInput(index - 1);
      }

      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pastedDigits) return;

    const nextDigits = Array.from({ length }, (_, index) => {
      return pastedDigits[index] ?? "";
    });

    updateValue(nextDigits);

    const nextIndex = Math.min(pastedDigits.length, length - 1);
    focusInput(nextIndex);
  };

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          value={digit}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          aria-label={`Цифра ${index + 1}`}
          className={[
            "size-14 rounded-lg border-2 bg-background text-center text-xl font-bold",
            "text-foreground outline-none transition-colors",
            "focus:border-foreground focus:ring-2 focus:ring-foreground/10",
            "disabled:cursor-not-allowed disabled:opacity-50",
            focusedIndex === index ? "border-foreground" : "border-border",
          ].join(" ")}
          onFocus={() => setFocusedIndex(index)}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
