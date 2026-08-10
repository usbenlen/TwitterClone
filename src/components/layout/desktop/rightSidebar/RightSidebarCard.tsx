/** @format */

import type { ReactNode } from "react";

interface RightSidebarCardProps {
  title: string;
  children: ReactNode;
}

export default function RightSidebarCard({
  title,
  children,
}: RightSidebarCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
