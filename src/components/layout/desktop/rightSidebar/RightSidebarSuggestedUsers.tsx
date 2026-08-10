/** @format */

import RightSidebarCard from "@/components/layout/desktop/rightSidebar/RightSidebarCard";

const users = ["OpenAI", "React", "TypeScript"];

export default function RightSidebarSuggestedUsers() {
  return (
    <RightSidebarCard title="Кого читати">
      <div className="space-y-3">
        {users.map((user) => (
          <button key={user} className="block text-left hover:text-primary">
            @{user}
          </button>
        ))}
      </div>
    </RightSidebarCard>
  );
}
