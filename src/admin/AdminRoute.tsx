import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { APP_ROUTES } from "@/constants/routes";

export default function AdminRoute() {
  const { user } = useAuth();

  return user?.role === "ADMIN" && !user.isBlocked ? (
    <Outlet />
  ) : (
    <Navigate to={APP_ROUTES.HOME} replace />
  );
}
