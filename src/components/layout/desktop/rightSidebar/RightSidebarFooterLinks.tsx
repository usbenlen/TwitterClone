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
        {FOOTER_LINKS.map((link) => (
          <button
            key={link}
            type="button"
            className="cursor-pointer hover:underline"
          >
            {link}
          </button>
        ))}
      </div>

      <p className="mt-3">{FOOTER_TECHNOLOGIES}</p>
      <p className="mt-3">
        © {new Date().getFullYear()} {APP_NAME}
      </p>
    </div>
  );
}
