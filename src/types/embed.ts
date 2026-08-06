export type EmbedProvider = "youtube" | "vimeo";

export interface Embed {
  id: string;
  provider: EmbedProvider;
  url: string;
  embedUrl: string;
  title: string;
  thumbnailUrl: string;
}
