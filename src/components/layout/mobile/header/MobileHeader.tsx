/** @format */

import AppLogo from "@/components/layout/common/AppLogo";

export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center justify-center-safe px-4">
        <AppLogo />
      </div>
    </header>
  );
}
