import type {
  Tweet,
  ToggleBookmarkResponse,
  ToggleLikeResponse,
  ToggleRepostResponse,
} from "@/types";

export function toggleLikeInList(
  items: Tweet[],
  id: string,
  likedByMe: boolean,
): {
  items: Tweet[];
  response: ToggleLikeResponse;
} {
  const updatedItems = items.map((item) =>
    item.id === id
      ? {
          ...item,
          likedByMe: !likedByMe,
          likesCount: likedByMe
            ? Math.max(0, item.likesCount - 1)
            : item.likesCount + 1,
        }
      : item,
  );

  const item = updatedItems.find((item) => item.id === id);

  if (!item)
    throw new Error("Пост або коментар не знайдено.");

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
  const updatedItems = items.map((item) =>
    item.id === id
      ? {
          ...item,
          repostedByMe: !repostedByMe,
          retweetsCount: repostedByMe
            ? Math.max(0, item.retweetsCount - 1)
            : item.retweetsCount + 1,
        }
      : item,
  );

  const item = updatedItems.find((item) => item.id === id);

  if (!item)
    throw new Error("Пост або коментар не знайдено.");

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
  const updatedItems = items.map((item) =>
    item.id === id
      ? {
          ...item,
          bookmarkedByMe: !bookmarkedByMe,
        }
      : item,
  );

  const item = updatedItems.find((item) => item.id === id);

  if (!item)
    throw new Error("Пост або коментар не знайдено.");

  return {
    items: updatedItems,
    response: {
      bookmarkedByMe: item.bookmarkedByMe,
    },
  };
}

export function incrementViewsInList(items: Tweet[], id: string): Tweet[] {
  const updatedItems = items.map((item) =>
    item.id === id
      ? {
          ...item,
          viewsCount: item.viewsCount + 1,
        }
      : item,
  );

  if (!updatedItems.some((item) => item.id === id))
    throw new Error("Пост або коментар не знайдено.");

  return updatedItems;
}
