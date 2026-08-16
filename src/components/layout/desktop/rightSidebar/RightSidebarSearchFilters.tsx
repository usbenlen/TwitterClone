import { Check, Circle } from "lucide-react";

import RightSidebarCard from "@/components/layout/desktop/rightSidebar/RightSidebarCard";

export default function RightSidebarSearchFilters() {
  return (
    <RightSidebarCard title="Search filters">
      <div className="space-y-5">
        <div>
          <h3 className="mb-2 text-sm font-bold text-foreground">People</h3>

          <div className="space-y-2">
            <button
              type="button"
              className="cursor-pointer flex w-full items-center justify-between text-sm text-foreground"
            >
              <span>From anyone</span>

              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3.5" />
              </span>
            </button>

            <button
              type="button"
              className="cursor-pointer flex w-full items-center justify-between text-sm text-foreground"
            >
              <span>People you follow</span>

              <Circle className="size-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold text-foreground">Location</h3>

          <div className="space-y-2">
            <button
              type="button"
              className="cursor-pointer flex w-full items-center justify-between text-sm text-foreground"
            >
              <span>Anywhere</span>

              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3.5" />
              </span>
            </button>

            <button
              type="button"
              className="cursor-pointer flex w-full items-center justify-between text-sm text-foreground"
            >
              <span>Near you</span>

              <Circle className="size-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="cursor-pointer text-sm text-primary transition hover:underline"
        >
          Advanced search
        </button>
      </div>
    </RightSidebarCard>
  );
}
