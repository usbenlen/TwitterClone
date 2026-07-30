/** @format */

import { createBrowserRouter } from "react-router";

import MainLayout from "@/layouts/MainLayout";
import { ProtectedRoute, GuestRoute } from "@/components/routeGuards";

import { HomePage, LoginPage, RegisterPage, ProfilePage } from "@/pages";

import { APP_ROUTES } from "@/constants/routes";

export const routes = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: APP_ROUTES.HOME,
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: APP_ROUTES.PROFILE,
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  {
    element: <GuestRoute />,
    children: [
      {
        path: APP_ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: APP_ROUTES.REGISTER,
        element: <RegisterPage />,
      },
    ],
  },
]);
