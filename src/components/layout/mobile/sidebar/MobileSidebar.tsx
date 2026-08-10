/** @format */

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/ui";
import { cn } from "@/utils/cn";

import AppLogo from "@/components/layout/common/AppLogo";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function MobileSidebar({
  open,
  onClose,
  children,
}: MobileSidebarProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[85vw] max-w-sm flex-col border-r border-border bg-background shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <AppLogo />

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Закрити меню"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </aside>
    </>
  );
}
