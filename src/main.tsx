import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";

import "@/index.css";

import { routes } from "@/routes";

import { AppEffects } from "@/providers/AppEffects";

import { store } from "@/store/store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AppEffects />
    <RouterProvider router={routes} />
  </Provider>,
);
