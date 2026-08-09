/** @format */
import type { SVGProps } from "react";

/*
 * Набір SVG-іконок як React-компоненти.
 * Успадковують колір через currentColor і розмір через props (за замовч. 20px).
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function HeartIcon({
  filled,
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(props)} fill={filled ? "currentColor" : "none"}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.5 5 10 6 12 8c2-2 3.5-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21Z" />
    </svg>
  );
}
