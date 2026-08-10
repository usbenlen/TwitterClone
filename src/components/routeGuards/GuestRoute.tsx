/** @format */

import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { APP_ROUTES } from "@/constants/routes";
import { Spinner } from "@/ui";

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner className="size-8 text-primary" />;
  if (isAuthenticated) return <Navigate to={APP_ROUTES.HOME} replace />;

  return <Outlet />;
}
