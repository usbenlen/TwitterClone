/** @format */

import { ThemeToggle } from "@/ui";
import AppLogo from "@/components/layout/common/AppLogo";

export default function LeftSidebarHeader() {
  return (
    <div className="p-4 flex items-center justify-between">
      <AppLogo />
      <ThemeToggle />
    </div>
  );
}
