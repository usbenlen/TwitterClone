import { Outlet } from "react-router";
import { AdminLeftSidebar } from "@/admin/components/layout/adminLeftSidebar";
import ScrollToTop from "@/ui/ScrollToTop.tsx";
import { useState, useEffect } from "react";

export default function AdminLayout() {
  const [isDesktop, setIsDesktop] = useState(
      typeof window !== "undefined" ? window.innerWidth >= 1200 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1200);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isDesktop) {
    return (
        <div className="flex min-h-screen items-start justify-center bg-background p-6 text-center">
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">
              Будь ласка, відкрийте адмін-панель на десктопі
            </h1>
            <p className="text-sm text-muted-foreground">
              Мінімальна ширина екрана для роботи з панеллю управління становить 1200 пікселів.
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        <ScrollToTop />
        <div className="mx-auto w-full max-w-[1366px] lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
          <AdminLeftSidebar />

          <main className="min-w-0 p-4 lg:p-8 pb-20 lg:pb-8">
            <Outlet />
          </main>
        </div>
      </div>
  );
}