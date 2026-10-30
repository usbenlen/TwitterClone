import LeftSidebarHeader from "@/widgets/navigation/desktop/leftSidebar/LeftSidebarHeader";
import LeftSidebarProfile from "@/widgets/navigation/desktop/leftSidebar/LeftSidebarProfile";
import { DesktopNavigation } from "@/widgets/navigation/desktop/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function LeftSidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-0 flex h-screen flex-col border-r border-border px-6 py-6">
        <LeftSidebarHeader />

        <div className="mt-6 flex-1">
          <DesktopNavigation vertical />
        </div>

        {user && (
          <div className="mt-auto flex flex-col gap-2">
            <LeftSidebarProfile />
          </div>
        )}
      </div>
    </aside>
  );
}
