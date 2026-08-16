import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/hooks/useAuth";

import { Spinner } from "@/ui";

import { APP_ROUTES } from "@/constants/routes";

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner className="size-8 text-primary" />;
  if (isAuthenticated) return <Navigate to={APP_ROUTES.HOME} replace />;

  return <Outlet />;
}
