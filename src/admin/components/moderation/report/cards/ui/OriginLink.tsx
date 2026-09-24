import { ExternalLink } from "lucide-react";

type ReportCardLinkProps = {
    label: string;
    href: string;
};

export default function OriginLink({
   label,
   href,
}: ReportCardLinkProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
            {label}

            <ExternalLink className="size-4" />
        </a>
    );
}