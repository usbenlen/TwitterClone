import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";

import { AppEffects } from "@/app/providers/AppEffects";
import { routes } from "@/app/router/routes";
import { store } from "@/app/store/store";

import "@/app/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AppEffects />
    <RouterProvider router={routes} />
  </Provider>,
);
