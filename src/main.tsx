/** @format */

import ReactDOM from "react-dom/client";
import "@/index.css";
import { routes } from "@/routes";
import { RouterProvider } from "react-router";

import { AuthProvider, ThemeProvider, FollowProvider } from "@/providers";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <FollowProvider>
        <RouterProvider router={routes} />
      </FollowProvider>
    </AuthProvider>
  </ThemeProvider>,
);
