/** @format */

import { useContext } from "react";
import { AuthContext } from "@/providers/AuthProvider";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth повинен використовуватись всередині AuthProvider");

  return context;
}
