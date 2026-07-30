/** @format */

import { Search } from "lucide-react";

export default function RightSidebarSearchBox() {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <div className="flex items-center gap-3">
        <Search className="size-5 text-muted-foreground" />

        <input
          type="text"
          placeholder="Пошук"
          className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
