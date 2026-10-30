import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { APP_ROUTES } from "@/shared/config/routes";

export default function AdminRoute() {
  const { user } = useAuth();

  return user?.role === "Admin" && !user.isBlocked ? (
    <Outlet />
  ) : (
    <Navigate to={APP_ROUTES.HOME} replace />
  );
}
