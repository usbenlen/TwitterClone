import type { Tweet } from "@/types/tweet";
import { currentUser, sampleAuthors } from "./users";
import umbertoImage from "@/mock/media/images/umberto-jXd2FSvcRr8-unsplash.jpg";

export let tweets: Tweet[] = [
  {
    id: "t1",
    content: "Щойно задеплоїв першу версію свого клону Twitter. Летимо!",
    attachments: [],
    author: currentUser,
    likesCount: 12,
    repliesCount: 3,
    retweetsCount: 1,
    viewsCount: 52,
    likedByMe: false,
    repostedByMe: true,
    bookmarkedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "t2",
    content: "Математика — це мова, якою написаний Всесвіт.",
    attachments: [{ id: "media-t2-1", type: "image", url: umbertoImage }, { id: "media-t2-1", type: "image", url: umbertoImage }],
    author: sampleAuthors[1],
    likesCount: 340,
    repliesCount: 21,
    retweetsCount: 58,
    viewsCount: 52,
    likedByMe: true,
    repostedByMe: false,
    bookmarkedByMe: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "t3",
    content: "Talk is cheap. Show me the code.",
    attachments: [],
    author: sampleAuthors[2],
    likesCount: 1200,
    repliesCount: 96,
    retweetsCount: 210,
    viewsCount: 52,
    likedByMe: false,
    repostedByMe: false,
    bookmarkedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

let idCounter = 100;

export const nextTweetId = () => `t${idCounter++}`;

export const setTweets = (newTweets: Tweet[]) => {
  tweets = newTweets;
};
