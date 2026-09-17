import { createBrowserRouter } from "react-router";

import MainLayout from "@/layouts/MainLayout";
import { ProtectedRoute, GuestRoute } from "@/components/routeGuards";

import {
  HomePage,
  PostPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  VerifyResetCodePage,
  ResetPasswordPage,
  VerifyEmailPage,
  ProfilePage,
  FollowingPage,
  FollowersPage,
  SettingsPage,
  SearchPage,
  BookmarksPage,
  FollowRecommendationsPage,
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
            path: APP_ROUTES.POST,
            element: <PostPage />,
          },
          {
            path: APP_ROUTES.SEARCH,
            element: <SearchPage />,
          },
          {
            path: APP_ROUTES.BOOKMARKS,
            element: <BookmarksPage />,
          },
          {
            path: APP_ROUTES.FOLLOW_RECOMMENDATIONS,
            element: <FollowRecommendationsPage />,
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
          {
            path: APP_ROUTES.SETTINGS,
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: APP_ROUTES.SETTINGS_CHANGE_PASSWORD,
        element: <VerifyResetCodePage variant="settings" />,
      },
      {
        path: APP_ROUTES.SETTINGS_CHANGE_PASSWORD_RESET,
        element: <ResetPasswordPage variant="settings" />,
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
        path: APP_ROUTES.VERIFY_EMAIL,
        element: <VerifyEmailPage />,
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
