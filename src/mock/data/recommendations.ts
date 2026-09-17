import type { TrendRecommendation } from "@/types";

export const mockTrends: TrendRecommendation[] = [
  {
    id: "trend-ukraine-tech",
    title: "Українські технології",
    context: "Популярне в Україні",
    query: "українські технології",
    postsCount: 18400,
  },
  {
    id: "trend-react-19",
    title: "React 19",
    context: "Технології · Популярне",
    query: "React 19",
    postsCount: 12700,
  },
  {
    id: "trend-space",
    title: "Космічні дослідження",
    context: "Наука · Популярне",
    query: "космічні дослідження",
    postsCount: 8650,
  },
  {
    id: "trend-typescript",
    title: "TypeScript",
    context: "Розробка · Популярне",
    query: "TypeScript",
    postsCount: 6900,
  },
];
