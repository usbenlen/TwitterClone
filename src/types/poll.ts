import type { ComposerMedia } from "@/types/composer";
import type { MediaAttachment } from "@/types/media";

export interface PollOption {
  id: string;
  text: string;
  image?: ComposerMedia;
}

export interface PollOptionInput {
  text: string;
  mediaId?: string;
}

export interface PollRequest {
  options: string[] | PollOptionInput[];
  duration: number;
}

export interface ComposerPoll {
  options: PollOption[];
  duration: number;
}

export interface TweetPollOption {
  id: string;
  text: string;
  votesCount: number;
  media?: MediaAttachment;
}

export interface TweetPoll {
  id: string;
  options: TweetPollOption[];
  totalVotes: number;
  expiresAt: string | null;
  votedOptionId?: string;
  isClosed: boolean;
}
