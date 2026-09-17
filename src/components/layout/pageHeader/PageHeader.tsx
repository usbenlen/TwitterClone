import type { ReactNode } from "react";
import type { To } from "react-router";

import BackButton from "@/components/layout/pageHeader/BackButton";
import { AppLogo } from "@/ui";
import { cn } from "@/utils/cn";

interface PageHeaderSharedProps {
  backTo?: To;
  backAriaLabel?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

type PageHeaderProps = PageHeaderSharedProps &
  (
    | {
        title: ReactNode;
        subtitle?: ReactNode;
        showMobileLogo?: boolean;
        content?: never;
      }
    | {
        content: ReactNode;
        title?: never;
        subtitle?: never;
        showMobileLogo?: never;
      }
  );

export default function PageHeader({
  title,
  subtitle,
  backTo,
  backAriaLabel,
  content,
  actions,
  footer,
  showMobileLogo = false,
  className,
}: PageHeaderProps) {
  return (
    <header
      data-page-header
      className={cn(
        "sticky top-0 z-header border-b border-border bg-background/80 backdrop-blur",
        className,
      )}
    >
      <div className="flex min-h-14 items-center gap-3 px-4">
        {backTo && <BackButton fallbackTo={backTo} ariaLabel={backAriaLabel} />}

        {content ? (
          <div className="flex min-w-0 flex-1 items-center">{content}</div>
        ) : (
          <div className="min-w-0 flex-1">
            {showMobileLogo && (
              <div className="flex justify-center lg:hidden">
                <h1 className="sr-only">{title}</h1>
                <AppLogo />
              </div>
            )}

            <div className={cn(showMobileLogo && "hidden lg:block")}>
              <h1 className="truncate text-xl font-bold text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="truncate text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {actions && <div className="flex shrink-0 items-center">{actions}</div>}
      </div>

      {footer}
    </header>
  );
}
