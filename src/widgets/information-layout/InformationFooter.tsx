import { RightSidebarFooterLinks } from "@/widgets/navigation/desktop/rightSidebar";
import { APP_ROUTES } from "@/shared/config/routes";
import { useAppSelector } from "@/shared/store/hooks";
import { AppLogo } from "@/shared/ui";

export function InformationFooter() {
  const user = useAppSelector((state) => state.auth.user);
  const homeRoute = user ? APP_ROUTES.HOME : APP_ROUTES.LANDING;
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <AppLogo
          to={homeRoute}
          className="rounded-sm text-5xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <RightSidebarFooterLinks className="text-center [&>div]:justify-center sm:text-right sm:[&>div]:justify-end" />
      </div>
    </footer>
  );
}
