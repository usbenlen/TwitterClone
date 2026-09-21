import { cn } from "@/utils/cn";

interface RightSidebarFooterLinksProps {
  className?: string;
}

export default function RightSidebarFooterLinks({
  className,
}: RightSidebarFooterLinksProps) {
  const links = ["Про нас", "Конфіденційність", "Умови", "Допомога"];

  return (
    <div className={cn("px-2 text-xs text-muted-foreground", className)}>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {links.map((link) => (
          <button
            key={link}
            type="button"
            className="cursor-pointer hover:underline"
          >
            {link}
          </button>
        ))}
      </div>

      <p className="mt-3">ASP.NET · TypeScript · React</p>
      <p className="mt-3">© {new Date().getFullYear()} Chirp</p>
    </div>
  );
}
