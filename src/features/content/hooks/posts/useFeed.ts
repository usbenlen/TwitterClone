import { useRecommendedPosts } from "@/features/discovery/hooks/useRecommendedPosts";

export function useFeed() {
  return useRecommendedPosts();
}
