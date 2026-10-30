import type { ComposerMedia } from "@/types/composer";

export interface PollOption {
  id: string;
  text: string;
  image?: ComposerMedia;
}

export interface ComposerPoll {
  options: PollOption[];
  duration: number;
}
