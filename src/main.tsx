import { Provider } from "react-redux";
import { store } from "@/store";
import ReactDOM from "react-dom/client";
import "@/index.css";
import { routes } from "@/routes";
import { RouterProvider } from "react-router";
import { AppEffects } from "@/providers/AppEffects";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AppEffects />
    <RouterProvider router={routes} />
  </Provider>,
);
