import { Outlet, ScrollRestoration } from "react-router";

import {
  InformationNavigation,
  InformationFooter,
} from "@/components/navigation";

export default function InformationLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <InformationNavigation />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Outlet />
      </main>

      <InformationFooter />
      <ScrollRestoration />
    </div>
  );
}
