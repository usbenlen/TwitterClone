import type { MediaAttachment } from "@/features/content/types/media";

export interface PollOptionInput {
  text: string;
  mediaId?: string;
}

export interface PollRequest {
  options: string[] | PollOptionInput[];
  duration: number;
}

export interface PostPollOption {
  id: string;
  text: string;
  votesCount: number;
  media?: MediaAttachment;
}

export interface PostPoll {
  id: string;
  options: PostPollOption[];
  totalVotes: number;
  expiresAt: string | null;
  votedOptionId?: string;
  isClosed: boolean;
}
