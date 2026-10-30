import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";

import MainLayout from "@/layouts/MainLayout";

import { APP_ROUTES } from "@/constants/routes";

import { AdminRoute, ProtectedRoute, GuestRoute } from "@/components/routing";

import { Spinner } from "@/components/ui/Spinner";

type PageModule = { default: ComponentType };

const lazyPage = (load: () => Promise<PageModule>) => async () => ({
  Component: (await load()).default,
});

export const routes = createBrowserRouter([
  {
    path: APP_ROUTES.GOOGLE_CALLBACK,
    lazy: lazyPage(() => import("@/pages/auth/GoogleCallbackPage")),
    hydrateFallbackElement: <Spinner className="size-8 text-primary" />,
  },
  {
    lazy: lazyPage(() => import("@/layouts/InformationLayout")),
    hydrateFallbackElement: <Spinner className="size-8 text-primary" />,
    children: [
      {
        path: APP_ROUTES.ABOUT,
        lazy: lazyPage(() => import("@/pages/information/AboutPage")),
      },
      {
        path: APP_ROUTES.PRIVACY,
        lazy: lazyPage(() => import("@/pages/information/PrivacyPage")),
      },
      {
        path: APP_ROUTES.TERMS,
        lazy: lazyPage(() => import("@/pages/information/TermsPage")),
      },
      {
        path: APP_ROUTES.HELP,
        lazy: lazyPage(() => import("@/pages/information/HelpPage")),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    hydrateFallbackElement: <Spinner className="size-8 text-primary" />,
    children: [
      {
        element: <AdminRoute />,
        children: [
          {
            path: APP_ROUTES.ADMIN,
            lazy: lazyPage(() => import("@/layouts/AdminLayout")),
            children: [
              {
                index: true,
                lazy: lazyPage(() => import("@/pages/admin/AdminDashboardPage")),
              },
              {
                path: APP_ROUTES.ADMIN_USERS,
                lazy: lazyPage(() => import("@/pages/admin/AdminUsersPage")),
              },
              {
                path: APP_ROUTES.ADMIN_USER,
                lazy: lazyPage(() => import("@/pages/admin/AdminUserPage")),
              },
              {
                path: APP_ROUTES.ADMIN_MODERATION,
                lazy: lazyPage(() => import("@/pages/admin/AdminModerationPage")),
              },
              {
                path: APP_ROUTES.ADMIN_REPORT,
                lazy: lazyPage(() => import("@/pages/admin/AdminReportPage")),
              },
              {
                path: APP_ROUTES.ADMIN_SETTINGS,
                lazy: lazyPage(() => import("@/pages/admin/AdminSettingsPage")),
              },
            ],
          },
        ],
      },
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
            path: APP_ROUTES.EXPLORE,
            lazy: lazyPage(() => import("@/pages/explore/ExplorePage")),
          },
          {
            path: APP_ROUTES.NOTIFICATIONS,
            lazy: lazyPage(() => import("@/pages/notifications/NotificationsPage")),
          },
          {
            path: APP_ROUTES.SETTINGS_NOTIFICATIONS,
            lazy: lazyPage(() => import("@/pages/notifications/NotificationSettingsPage")),
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
