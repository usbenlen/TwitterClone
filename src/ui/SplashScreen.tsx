/** @format */

import { Spinner } from "@/ui";

export default function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">Twitter Clone</h1>

        <Spinner />

        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
