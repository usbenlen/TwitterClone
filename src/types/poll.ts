export interface PollOption {
  id: string;
  text: string;
}

export interface ComposerPoll {
  options: PollOption[];
  duration: number;
}

export interface TweetPollOption {
  id: string;
  text: string;
  votesCount: number;
}

export interface TweetPoll {
  id: string;
  options: TweetPollOption[];
  totalVotes: number;
  expiresAt: string;
  votedOptionId?: string;
  isClosed: boolean;
}
