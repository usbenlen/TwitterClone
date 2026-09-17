import type {
  Location,
  SearchCriteria,
  SearchViewerContext,
  Tweet,
  UserShort,
} from "@/types";

import { sampleAuthors, tweets } from "@/mock/data";
import { delay } from "@/mock/utils/delay";

const NEARBY_RADIUS_KM = 50;

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
  const haversine = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(startLatitude) *
    Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function isNearViewer(
  location: Location | null | undefined,
  viewer?: SearchViewerContext,
) {
  if (!location || !viewer?.location) return false;
  return distanceInKm(location, viewer.location) <= NEARBY_RADIUS_KM;
}

export const mockSearchApi = {
  async users(
    criteria: SearchCriteria,
    viewer?: SearchViewerContext,
  ): Promise<UserShort[]> {
    await delay(250);

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
      .map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        avatarUrl: user.avatarUrl ?? null,
        isVerified: user.isVerified,
      }));
  },

  async posts(
    criteria: SearchCriteria,
    viewer?: SearchViewerContext,
  ): Promise<Tweet[]> {
    await delay(250);

    const from = criteria.from.toLowerCase().replace(/^@+/, "");
    const start = criteria.fromDate
      ? new Date(`${criteria.fromDate}T00:00:00`).getTime()
      : undefined;
    const end = criteria.toDate
      ? new Date(`${criteria.toDate}T23:59:59.999`).getTime()
      : undefined;

    return tweets.filter((tweet) => {
      const createdAt = new Date(tweet.createdAt).getTime();

      return (
        matchesText(tweet.content, criteria) &&
        (!from || tweet.author.username.toLowerCase() === from) &&
        (criteria.people !== "following" || viewer?.followingIds.includes(tweet.author.id)) &&
        (criteria.location !== "near" || isNearViewer(tweet.location, viewer)) &&
        (criteria.minReplies === undefined || tweet.repliesCount >= criteria.minReplies) &&
        (criteria.minLikes === undefined || tweet.likesCount >= criteria.minLikes) &&
        (criteria.minReposts === undefined || tweet.retweetsCount >= criteria.minReposts) &&
        (start === undefined || createdAt >= start) &&
        (end === undefined || createdAt <= end) &&
        (!criteria.hasMedia || tweet.attachments.length > 0)
      );
    });
  },
};
