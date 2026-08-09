/** @format */

import { createBrowserRouter } from "react-router";

import MainLayout from "@/layouts/MainLayout";
import { ProtectedRoute, GuestRoute } from "@/components/routeGuards";

import {
  HomePage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  VerifyResetCodePage,
  ResetPasswordPage,
  ProfilePage,
  FollowingPage,
  FollowersPage,
} from "@/pages";

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
          {
            path: APP_ROUTES.FOLLOWING,
            element: <FollowingPage />,
          },
          {
            path: APP_ROUTES.FOLLOWERS,
            element: <FollowersPage />,
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
      {
        path: APP_ROUTES.FORGOT_PASSWORD,
        element: <ForgotPasswordPage />,
      },
      {
        path: APP_ROUTES.VERIFY_RESET_CODE,
        element: <VerifyResetCodePage />,
      },
      {
        path: APP_ROUTES.RESET_PASSWORD,
        element: <ResetPasswordPage />,
      },
    ],
  },
]);
