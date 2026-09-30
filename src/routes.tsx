import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";

import MainLayout from "@/layouts/MainLayout";
import { ProtectedRoute, GuestRoute } from "@/components/routeGuards";
import { APP_ROUTES } from "@/constants/routes";
import { Spinner } from "@/ui/Spinner";

type PageModule = { default: ComponentType };

const lazyPage = (load: () => Promise<PageModule>) => async () => ({
  Component: (await load()).default,
});

export const routes = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    hydrateFallbackElement: <Spinner className="size-8 text-primary" />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: APP_ROUTES.HOME,
            lazy: lazyPage(() => import("@/pages/home/HomePage")),
          },
          {
            path: APP_ROUTES.POST,
            lazy: lazyPage(() => import("@/pages/post/PostPage")),
          },
          {
            path: APP_ROUTES.SEARCH,
            lazy: lazyPage(() => import("@/pages/search/SearchPage")),
          },
          {
            path: APP_ROUTES.BOOKMARKS,
            lazy: lazyPage(() => import("@/pages/bookmarks/BookmarksPage")),
          },
          {
            path: APP_ROUTES.FOLLOW_RECOMMENDATIONS,
            lazy: lazyPage(
              () => import("@/pages/follow/FollowRecommendationsPage"),
            ),
          },
          {
            path: APP_ROUTES.PROFILE,
            lazy: lazyPage(() => import("@/pages/profile/ProfilePage")),
          },
          {
            path: APP_ROUTES.FOLLOWING,
            lazy: lazyPage(() => import("@/pages/profile/FollowingPage")),
          },
          {
            path: APP_ROUTES.FOLLOWERS,
            lazy: lazyPage(() => import("@/pages/profile/FollowersPage")),
          },
          {
            path: APP_ROUTES.SETTINGS,
            lazy: lazyPage(() => import("@/pages/settings/SettingsPage")),
          },
        ],
      },
      {
        path: APP_ROUTES.SETTINGS_CHANGE_PASSWORD,
        lazy: async () => {
          const { default: VerifyResetCodePage } =
            await import("@/pages/auth/VerifyResetCodePage");
          return {
            Component: () => <VerifyResetCodePage variant="settings" />,
          };
        },
      },
      {
        path: APP_ROUTES.SETTINGS_CHANGE_PASSWORD_RESET,
        lazy: async () => {
          const { default: ResetPasswordPage } =
            await import("@/pages/auth/ResetPasswordPage");
          return { Component: () => <ResetPasswordPage variant="settings" /> };
        },
      },
    ],
  },

  {
    element: <GuestRoute />,
    hydrateFallbackElement: <Spinner className="size-8 text-primary" />,
    children: [
      {
        path: APP_ROUTES.LANDING,
        lazy: lazyPage(() => import("@/pages/landing/LandingPage")),
      },
      {
        path: APP_ROUTES.LOGIN,
        lazy: lazyPage(() => import("@/pages/auth/LoginPage")),
      },
      {
        path: APP_ROUTES.REGISTER,
        lazy: lazyPage(() => import("@/pages/auth/RegisterPage")),
      },
      {
        path: APP_ROUTES.VERIFY_EMAIL,
        lazy: lazyPage(() => import("@/pages/auth/VerifyEmailPage")),
      },
      {
        path: APP_ROUTES.FORGOT_PASSWORD,
        lazy: lazyPage(() => import("@/pages/auth/ForgotPasswordPage")),
      },
      {
        path: APP_ROUTES.VERIFY_RESET_CODE,
        lazy: lazyPage(() => import("@/pages/auth/VerifyResetCodePage")),
      },
      {
        path: APP_ROUTES.RESET_PASSWORD,
        lazy: lazyPage(() => import("@/pages/auth/ResetPasswordPage")),
      },
    ],
  },
]);
