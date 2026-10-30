import { Link } from "react-router";

import { APP_NAME } from "@/constants/app";
import { FOOTER_LINKS, FOOTER_TECHNOLOGIES } from "@/constants/layout";

import { cn } from "@/utils/cn";

interface RightSidebarFooterLinksProps {
  className?: string;
}

export default function RightSidebarFooterLinks({
  className,
}: RightSidebarFooterLinksProps) {
  return (
    <div className={cn("px-2 text-xs text-muted-foreground", className)}>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {FOOTER_LINKS.map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            className="hover:underline"
          >
            {label}
          </Link>
        ))}
      </div>

      <p className="mt-3">{FOOTER_TECHNOLOGIES}</p>
      <p className="mt-3">
        © {new Date().getFullYear()} {APP_NAME}
      </p>
    </div>
  );
}
