import type { Post } from "@/features/content/types";
import type { User } from "@/features/profiles/types";

export function updatePostAuthors(items: Post[], user: User): void {
  const visited = new Set<Post>();

  const visit = (post: Post) => {
    if (visited.has(post)) return;
    visited.add(post);

    if (post.author.id === user.id) {
      post.author = {
        ...post.author,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl ?? null,
        isVerified: user.isVerified,
        role: user.role,
      };
    }

    post.ancestors?.forEach(visit);
    if (post.quote?.target) visit(post.quote.target);
  };

  items.forEach(visit);
}
