import { useContext } from "react";
import { FollowContext } from "@/providers/FollowProvider";

export function useFollow() {
  const context = useContext(FollowContext);

  if (!context) {
    throw new Error(
      "useFollow повинен використовуватись всередині FollowProvider"
    );
  }

  return context;
}