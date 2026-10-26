import type { Tweet } from "@/types/tweet";
import type { TweetPoll } from "@/types/poll";
import type { MediaAttachment } from "@/types/media";

import {
  HOURS_PER_DAY,
  MILLISECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
} from "@/constants/date";

import { currentUser, sampleAuthors } from "@/mock/data/users";
import { locations } from "@/mock/data/locations";
import { discoveryCommentSeeds } from "@/mock/data/discoveryComments";

type DiscoveryPost = Pick<Tweet, "author" | "content"> &
  Partial<Pick<Tweet, "attachments" | "poll" | "location" | "linkPreview">>;

const seededAt = Date.now();
const pollExpiresAt = new Date(
  seededAt + 3 * HOURS_PER_DAY * MINUTES_PER_HOUR * MILLISECONDS_PER_MINUTE,
).toISOString();

function photoUrl(photoId: string) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&h=800&q=80`;
}

function photo(id: string, photoId: string): MediaAttachment {
  return {
    id,
    type: "image",
    url: photoUrl(photoId),
    width: 1200,
    height: 800,
  };
}

function discoveryPoll(
  id: string,
  options: [string, number, MediaAttachment?][],
): TweetPoll {
  return {
    id,
    options: options.map(([text, votesCount, media], index) => ({
      id: `${id}-option-${index + 1}`,
      text,
      votesCount,
      ...(media ? { media } : {}),
    })),
    totalVotes: options.reduce((sum, [, votesCount]) => sum + votesCount, 0),
    expiresAt: pollExpiresAt,
    isClosed: false,
  };
}

const discoveryPostSeeds: DiscoveryPost[] = [
  {
    author: sampleAuthors[5],
    content:
      "Українські технології та цифрові послуги стають ближчими 💻 Сьогодні пробую React 19 та TypeScript у невеликому навчальному проєкті. Зібрав цікаві зміни з офіційного блогу: https://react.dev/blog/2024/12/05/react-19",
    linkPreview: {
      id: "t4-link-react",
      url: "https://react.dev/blog/2024/12/05/react-19",
      domain: "react.dev",
      title: "React 19: що нового в офіційному релізі",
      imageUrl: photoUrl("photo-1498050108023-c5249f4df085"),
    },
  },
  {
    author: sampleAuthors[7],
    content:
      "Уявіть, що ми видаємо фантастичний роман «Останній сигнал» 📡 Тексту ще немає, зате вже обираємо обкладинку. Яке фото змусило б вас узяти книжку з полиці? Сюжет запропонуйте в коментарях.",
    poll: discoveryPoll("t14-poll-last-signal", [
      [
        "Сигнал із лісу",
        18,
        photo("t14-poll-image-forest", "photo-1441974231531-c6227db76b6e"),
      ],
      [
        "Орбіта мовчання",
        26,
        photo("t14-poll-image-orbit", "photo-1446776811953-b23d57bd21aa"),
      ],
      [
        "За межами туманності",
        12,
        photo("t14-poll-image-nebula", "photo-1462331940025-496dfbfc7564"),
      ],
    ]),
  },
  {
    author: sampleAuthors[7],
    content:
      "Космічні дослідження починаються з допитливості 🚀 Наукові відкриття надихнули нашу команду провести відкриту зустріч про математику польотів. А поки — трохи космічного натхнення!",
    attachments: [photo("t5-image-space", "photo-1446776811953-b23d57bd21aa")],
  },
  {
    author: sampleAuthors[4],
    content:
      "Український футбол чи баскетбол? ⚽ На вихідних збираємо друзів на майданчику, а ввечері обговоримо найцікавіші моменти матчів. За який спорт голосуєте?",
    poll: discoveryPoll("t6-poll-sports", [
      ["Футбол", 42],
      ["Баскетбол", 31],
      ["Обидва", 18],
    ]),
  },
  {
    author: sampleAuthors[6],
    content:
      "Знайшов чудові велосипедні маршрути вздовж парків 🚲 Залишаю кілька кадрів для настрою. А ви вже плануєте київський марафон? Поділіться улюбленими місцями для тренувань.",
    attachments: [
      photo("t7-image-cycling", "photo-1485965120184-e220f721d03e"),
      photo("t7-image-park", "photo-1441974231531-c6227db76b6e"),
    ],
    location: locations[0],
  },
  {
    author: sampleAuthors[1],
    content:
      "Міські ініціативи об’єднують людей 📚 У бібліотеці запускаємо освітні проєкти з програмування. Почнемо з безкоштовної зустрічі для новачків у Львові. Приходьте зі своїми ідеями!",
    location: locations[1],
  },
  {
    author: sampleAuthors[3],
    content:
      "Зелена енергетика — тема нашого наступного обговорення ☀️ Хочу зібрати прості приклади того, як громади використовують сонячну енергію. Є знайомі проєкти? Розкажіть у коментарях.",
    attachments: [photo("t9-image-solar", "photo-1508514177221-188b1cf16e9d")],
  },
  {
    author: sampleAuthors[4],
    content:
      "Великий теніс вчить терпінню 🎾 Сьогодні вперше вийшло втримати довгий розіграш. Маленькі щоденні тренування працюють краще за гонитву за результатом.",
    attachments: [photo("t10-image-tennis", "photo-1554068865-24cecd4e34b8")],
  },
  {
    author: sampleAuthors[5],
    content:
      "Українське кіно стало темою нашого кіноклубу 🎬 Знайшли натхнення у Довженко-Центрі: https://dovzhenkocentre.org/ Наступного разу обговоримо новий серіал і те, як музика допомагає розповідати історію.",
    linkPreview: {
      id: "t11-link-cinema",
      url: "https://dovzhenkocentre.org/",
      domain: "dovzhenkocentre.org",
      title: "Довженко-Центр — відкривайте українське кіно",
      imageUrl: photoUrl("photo-1489599849927-2ee91cede3ba"),
    },
  },
  {
    author: sampleAuthors[8],
    content:
      "Ідеальний вечір у Львові: жива музика у дворі, чай і настільні ігри з друзями 🎲 Обираємо гру на наступну зустріч. За що ваш голос?",
    location: locations[1],
    poll: discoveryPoll("t12-poll-games", [
      ["Dixit", 18],
      ["Каркасон", 26],
      ["UNO", 32],
      ["Кодові імена", 24],
    ]),
  },
  {
    author: sampleAuthors[2],
    content:
      "Готуємо невеликий ігровий фестиваль для спільноти 🎮 Відкритий код дозволяє кожному долучитися: запропонуйте механіку гри або допоможіть з інтерфейсом. Напишіть, що хотіли б створити разом!",
  },
];

const discoveryPosts: Tweet[] = discoveryPostSeeds.map((post, index) => ({
  id: `t${index + 4}`,
  versionId: `t${index + 4}-v1`,
  attachments: [],
  ...post,
  likesCount: 24 + index * 17,
  repliesCount: discoveryCommentSeeds[`t${index + 4}`]?.length ?? 0,
  retweetsCount: 2 + index * 3,
  viewsCount: 180 + index * 91,
  likedByMe: false,
  repostedByMe: false,
  bookmarkedByMe: false,
  createdAt: new Date(
    seededAt - (index + 1) * MINUTES_PER_HOUR * MILLISECONDS_PER_MINUTE,
  ).toISOString(),
}));

export let tweets: Tweet[] = [
  {
    id: "t1",
    versionId: "t1-v1",
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
    versionId: "t2-v1",
    content: "Математика — це мова, якою написаний Всесвіт.",
    attachments: [],
    author: sampleAuthors[1],
    location: sampleAuthors[1].location,
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
    versionId: "t3-v1",
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
  ...discoveryPosts,
];

let idCounter = 100;

export const nextTweetId = () => `t${idCounter++}`;

export const setTweets = (newTweets: Tweet[]) => {
  tweets = newTweets;
};
