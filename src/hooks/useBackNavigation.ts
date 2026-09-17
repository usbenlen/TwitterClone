import { useCallback } from "react";
import { useNavigate, type To } from "react-router";

export function useBackNavigation(fallbackTo: To) {
  const navigate = useNavigate();

  return useCallback(() => {
    const historyIndex = window.history.state?.idx;

    if (typeof historyIndex === "number" && historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo, { replace: true });
  }, [fallbackTo, navigate]);
}
