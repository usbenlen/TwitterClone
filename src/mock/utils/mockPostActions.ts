import type {
  Post,
  ToggleBookmarkResponse,
  ToggleLikeResponse,
  ToggleRepostResponse,
} from "@/types/post";

function updatePostInList(
  items: Post[],
  id: string,
  update: (item: Post) => Post,
) {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Пост або коментар не знайдено.");

  const next = [...items];
  const item = update(next[index]);
  next[index] = item;

  return { items: next, item };
}

export function toggleLikeInList(
  items: Post[],
  id: string,
  likedByMe: boolean,
): {
  items: Post[];
  response: ToggleLikeResponse;
} {
  const { items: updatedItems, item } = updatePostInList(
    items,
    id,
    (item) => ({
      ...item,
      likedByMe: !likedByMe,
      likesCount: Math.max(0, item.likesCount + (likedByMe ? -1 : 1)),
    }),
  );

  return {
    items: updatedItems,
    response: {
      likedByMe: item.likedByMe,
      likesCount: item.likesCount,
    },
  };
}

export function toggleRepostInList(
  items: Post[],
  id: string,
  repostedByMe: boolean,
): {
  items: Post[];
  response: ToggleRepostResponse;
} {
  const { items: updatedItems, item } = updatePostInList(
    items,
    id,
    (item) => ({
      ...item,
      repostedByMe: !repostedByMe,
      retweetsCount: Math.max(0, item.retweetsCount + (repostedByMe ? -1 : 1)),
    }),
  );

  return {
    items: updatedItems,
    response: {
      repostedByMe: item.repostedByMe,
      repostsCount: item.retweetsCount,
    },
  };
}

export function toggleBookmarkInList(
  items: Post[],
  id: string,
  bookmarkedByMe: boolean,
): {
  items: Post[];
  response: ToggleBookmarkResponse;
} {
  const { items: updatedItems, item } = updatePostInList(
    items,
    id,
    (item) => ({ ...item, bookmarkedByMe: !bookmarkedByMe }),
  );

  return {
    items: updatedItems,
    response: {
      bookmarkedByMe: item.bookmarkedByMe,
    },
  };
}

export function incrementViewsInList(items: Post[], id: string): Post[] {
  return updatePostInList(items, id, (item) => ({
    ...item,
    viewsCount: item.viewsCount + 1,
  })).items;
}
