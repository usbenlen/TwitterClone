import { useRecommendedPosts } from "@/hooks/useRecommendedPosts";

export function useFeed() {
  return useRecommendedPosts();
}
