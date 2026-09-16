import ReactDOM from "react-dom/client";
import "@/index.css";
import { routes } from "@/routes";
import { RouterProvider } from "react-router";

import {
  AuthProvider,
  ThemeProvider,
  FollowProvider,
  ScheduledPostsProvider,
} from "@/providers";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <ScheduledPostsProvider>
        <FollowProvider>
          <RouterProvider router={routes} />
        </FollowProvider>
      </ScheduledPostsProvider>
    </AuthProvider>
  </ThemeProvider>,
);
