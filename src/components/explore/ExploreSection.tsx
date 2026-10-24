import type { ReactNode } from "react";
import { Link } from "react-router";

interface ExploreSectionProps {
  title: string;
  moreTo?: string;
  children: ReactNode;
}

export function ExploreSection({
  title,
  moreTo,
  children,
}: ExploreSectionProps) {
  return (
    <section className="border-b border-border py-2" aria-label={title}>
      <h2 className="px-4 pb-1 pt-3 text-xl font-extrabold text-foreground">
        {title}
      </h2>
      {children}
      {moreTo && (
        <Link
          to={moreTo}
          aria-label={`${title}: показати більше`}
          className="block px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-muted/40 focus-visible:focus-indicator"
        >
          Показати більше
        </Link>
      )}
    </section>
  );
}
