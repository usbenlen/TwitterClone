import type {
  Tweet,
  ToggleBookmarkResponse,
  ToggleLikeResponse,
  ToggleRepostResponse,
} from "@/types";

function updateTweetInList(
  items: Tweet[],
  id: string,
  update: (item: Tweet) => Tweet,
) {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Пост або коментар не знайдено.");
  const next = [...items];
  const item = update(next[index]);
  next[index] = item;
  return { items: next, item };
}

export function toggleLikeInList(
  items: Tweet[],
  id: string,
  likedByMe: boolean,
): {
  items: Tweet[];
  response: ToggleLikeResponse;
} {
  const { items: updatedItems, item } = updateTweetInList(
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
  items: Tweet[],
  id: string,
  repostedByMe: boolean,
): {
  items: Tweet[];
  response: ToggleRepostResponse;
} {
  const { items: updatedItems, item } = updateTweetInList(
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
  items: Tweet[],
  id: string,
  bookmarkedByMe: boolean,
): {
  items: Tweet[];
  response: ToggleBookmarkResponse;
} {
  const { items: updatedItems, item } = updateTweetInList(
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

export function incrementViewsInList(items: Tweet[], id: string): Tweet[] {
  return updateTweetInList(items, id, (item) => ({
    ...item,
    viewsCount: item.viewsCount + 1,
  })).items;
}
