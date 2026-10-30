import { Outlet } from "react-router";

import { AdminNavigation } from "@/widgets/admin-layout/AdminNavigation";

export default function AdminLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <AdminNavigation />
      <main className="min-w-0">
        <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
