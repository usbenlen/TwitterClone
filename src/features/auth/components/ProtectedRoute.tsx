import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { APP_ROUTES } from "@/shared/config/routes";
import { Spinner } from "@/shared/ui";

// Пускає далі лише авторизованих, поки триває перевірка токена показує спінер
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner className="size-8 text-primary" />;

  if (!isAuthenticated)
    return (
      <Navigate to={APP_ROUTES.LOGIN} replace state={{ from: location }} />
    );

  return <Outlet />;
}
