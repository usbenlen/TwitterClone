/** @format */

import RightSidebarCard from "@/components/layout/desktop/rightSidebar/RightSidebarCard";

const trends = ["#React", "#TypeScript", "#ASPNET", "#TailwindCSS"];

export default function RightSidebarTrendsCard() {
  return (
    <RightSidebarCard title="Популярне">
      <div className="space-y-3">
        {trends.map((trend) => (
          <button
            key={trend}
            className="block text-left text-primary transition hover:underline"
          >
            {trend}
          </button>
        ))}
      </div>
    </RightSidebarCard>
  );
}
