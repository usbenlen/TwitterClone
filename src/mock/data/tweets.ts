/** @format */

import type { Tweet } from "@/types/tweet";
import { currentUser, sampleAuthors } from "./users";

export let tweets: Tweet[] = [
  {
    id: "t1",
    content: "Щойно задеплоїв першу версію свого клону Twitter. Летимо!",
    attachments: [],
    author: currentUser,
    likesCount: 12,
    repliesCount: 3,
    retweetsCount: 1,
    likedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "t2",
    content: "Математика — це мова, якою написаний Всесвіт.",
    attachments: [],
    author: sampleAuthors[1],
    likesCount: 340,
    repliesCount: 21,
    retweetsCount: 58,
    likedByMe: true,
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
    likedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

let idCounter = 100;

export const nextTweetId = () => `t${idCounter++}`;

export const setTweets = (newTweets: Tweet[]) => {
  tweets = newTweets;
};
