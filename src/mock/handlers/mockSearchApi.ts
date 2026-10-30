import { MOCK_DELAYS } from "@/mock/mockConfig";

import { SEARCH_NEARBY_RADIUS_KM } from "@/constants/search";

import type {
  Location,
  SearchCriteria,
  SearchViewerContext,
  Post,
  UserShort,
} from "@/types";

import { sampleAuthors } from "@/mock/data/users";
import { posts } from "@/mock/data/posts";

import { delay } from "@/mock/utils/delay";
import { toUserShort } from "@/utils/postAuthor";

function words(value: string) {
  return value
    .toLowerCase()
    .split(/[\s,]+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function matchesText(text: string, criteria: SearchCriteria) {
  const normalizedText = text.toLowerCase();
  const allWords = words(criteria.query);
  const anyWords = words(criteria.anyWords);
  const excludedWords = words(criteria.excludeWords);

  return (
    allWords.every((word) => normalizedText.includes(word)) &&
    (!criteria.exactPhrase || normalizedText.includes(criteria.exactPhrase.toLowerCase())) &&
    (anyWords.length === 0 || anyWords.some((word) => normalizedText.includes(word))) &&
    excludedWords.every((word) => !normalizedText.includes(word))
  );
}

function distanceInKm(first: Location, second: Location) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const startLatitude = toRadians(first.latitude);
  const endLatitude = toRadians(second.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 + Math.cos(startLatitude) *
      Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function isNearViewer(
  location: Location | null | undefined,
  viewer?: SearchViewerContext,
) {
  if (!location || !viewer?.location) return false;
  return distanceInKm(location, viewer.location) <= SEARCH_NEARBY_RADIUS_KM;
}

export const mockSearchApi = {
  async users(
    criteria: SearchCriteria,
    viewer?: SearchViewerContext,
  ): Promise<UserShort[]> {
    await delay(MOCK_DELAYS.SEARCH);

    return sampleAuthors
      .filter((user) => {
        const searchableText = [
          user.username,
          user.displayName,
          user.bio,
          user.location?.name,
          user.location?.country,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          matchesText(searchableText, criteria) &&
          (criteria.people !== "following" || viewer?.followingIds.includes(user.id)) &&
          (criteria.location !== "near" || isNearViewer(user.location, viewer))
        );
      })
      .map(toUserShort);
  },

  async posts(
    criteria: SearchCriteria,
    viewer?: SearchViewerContext,
  ): Promise<Post[]> {
    await delay(MOCK_DELAYS.SEARCH);

    const from = criteria.from.toLowerCase().replace(/^@+/, "");
    const start = criteria.fromDate
      ? new Date(`${criteria.fromDate}T00:00:00`).getTime()
      : undefined;
    const end = criteria.toDate
      ? new Date(`${criteria.toDate}T23:59:59.999`).getTime()
      : undefined;

    return posts.filter((post) => {
      const createdAt = new Date(post.createdAt).getTime();

      return (
        matchesText(post.content, criteria) &&
        (!from || post.author.username.toLowerCase() === from) &&
        (criteria.people !== "following" || viewer?.followingIds.includes(post.author.id)) &&
        (criteria.location !== "near" || isNearViewer(post.location, viewer)) &&
        (criteria.minReplies === undefined || post.repliesCount >= criteria.minReplies) &&
        (criteria.minLikes === undefined || post.likesCount >= criteria.minLikes) &&
        (criteria.minReposts === undefined || post.retweetsCount >= criteria.minReposts) &&
        (start === undefined || createdAt >= start) &&
        (end === undefined || createdAt <= end) &&
        (!criteria.hasMedia || post.attachments.length > 0)
      );
    });
  },
};
