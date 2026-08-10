/** @format */

import { NavLink } from "react-router";
import { APP_ROUTES } from "@/constants/routes";

export default function AppLogo() {
  return (
    <NavLink
      to={APP_ROUTES.HOME}
      className="text-4xl font-black tracking-tight text-primary leading-none"
    >
      Chirp
    </NavLink>
  );
}
