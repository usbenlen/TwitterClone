import type { Location } from "@/types/location";

export type SearchType = "posts" | "users";
export type SearchPeople = "anyone" | "following";
export type SearchLocation = "anywhere" | "near";

export interface SearchCriteria {
  query: string;
  type: SearchType;
  people: SearchPeople;
  location: SearchLocation;
  exactPhrase: string;
  anyWords: string;
  excludeWords: string;
  from: string;
  minReplies?: number;
  minLikes?: number;
  minReposts?: number;
  fromDate: string;
  toDate: string;
  hasMedia: boolean;
}

export interface SearchViewerContext {
  followingIds: string[];
  location?: Location | null;
}
