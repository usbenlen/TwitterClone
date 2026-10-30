import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/hooks/auth/useAuth";

import { Spinner } from "@/components/ui/Spinner";

import { APP_ROUTES } from "@/constants/routes";

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from
    ?.pathname;

  if (isLoading) return <Spinner className="size-8 text-primary" />;
  if (isAuthenticated)
    return (
      <Navigate
        to={
          location.pathname === APP_ROUTES.LOGIN
            ? (from ?? APP_ROUTES.HOME)
            : APP_ROUTES.HOME
        }
        replace
      />
    );

  return <Outlet />;
}
