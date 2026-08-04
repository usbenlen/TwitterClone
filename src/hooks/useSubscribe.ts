import { useContext } from "react";
import { SubscribeContext } from "@/providers/SubscribeProvider";

export function useSubscribe() {
  const context = useContext(SubscribeContext);

  if (!context) {
    throw new Error(
      "useSubscribe must be used inside SubscribeProvider"
    );
  }

  return context;
}