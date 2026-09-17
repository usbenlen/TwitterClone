import { useAuth } from "@/hooks/useAuth";

import { AdminNavigation } from "@/admin/components/layout/navigation";
import {
  AdminLeftSidebarProfile,
  AdminLeftSidebarHeader,
} from "@/admin/components/layout/adminLeftSidebar";

export default function AdminLeftSidebar() {
  const { user } = useAuth();

  return (
      <aside className="hidden lg:block">
        <div className="sticky top-0 flex h-screen flex-col border-r border-border px-6 py-6">
          <AdminLeftSidebarHeader />

          <div className="mt-6 flex-1">
            <AdminNavigation vertical />
          </div>

          {user && (
              <div className="mt-auto flex flex-col gap-2">
                <AdminLeftSidebarProfile />
              </div>
          )}
        </div>
      </aside>
  );
}
