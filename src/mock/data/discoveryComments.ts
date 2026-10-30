import { locations } from "@/mock/data/locations";
import { currentUser, sampleAuthors } from "@/mock/data/users";

import type { Post } from "@/features/content/types";
import type { User } from "@/features/profiles/types";

type DiscoveryCommentSeed = Pick<Post, "id" | "content"> &
  Partial<
    Pick<Post, "parentCommentId" | "attachments" | "location" | "likesCount">
  > & {
    author: User;
    minutesAfterPost: number;
  };

// Shared by post counters and comment fixtures; this module does not import either.
export const discoveryCommentSeeds: Record<string, DiscoveryCommentSeed[]> = {
  t4: [
    {
      id: "c7",
      author: sampleAuthors[2],
      content: "А з формами стало простіше? Я поки на 18-й сиджу 🙂",
      minutesAfterPost: 9,
      likesCount: 2,
    },
    {
      id: "c8",
      author: currentUser,
      content: "Зберіг, дочитаю після роботи.",
      minutesAfterPost: 24,
    },
    {
      id: "c9",
      parentCommentId: "c7",
      author: sampleAuthors[5],
      content: "Так, якраз їх пробую. Але ще не все перенесла.",
      minutesAfterPost: 38,
      likesCount: 1,
    },
  ],
  t5: [
    {
      id: "c10",
      author: sampleAuthors[3],
      content: "Цей кадр теж люблю. Масштаб взагалі не вкладається в голові ✨",
      minutesAfterPost: 17,
      attachments: [
        {
          id: "c10-image-nebula",
          type: "image",
          url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&h=800&q=80",
          width: 1200,
          height: 800,
        },
      ],
      likesCount: 4,
    },
    {
      id: "c11",
      author: sampleAuthors[8],
      content: "На зустріч треба десь реєструватись?",
      minutesAfterPost: 46,
    },
  ],
  t6: [
    {
      id: "c12",
      author: sampleAuthors[6],
      content: "За баскетбол. Тільки не о восьмій ранку, будь ласка",
      minutesAfterPost: 12,
      likesCount: 1,
    },
    {
      id: "c13",
      author: sampleAuthors[8],
      content: "Футбол. Але грати, а не дивитись 😅",
      minutesAfterPost: 31,
    },
  ],
  t7: [
    {
      id: "c14",
      author: sampleAuthors[4],
      content: "А де зазвичай катаєшся в Києві? Шукаю щось без машин.",
      minutesAfterPost: 8,
    },
    {
      id: "c15",
      author: sampleAuthors[1],
      content:
        "Сьогодні вистачило сил тільки на коло біля дому. Теж рахується 😄",
      location: locations[0],
      minutesAfterPost: 23,
      likesCount: 2,
    },
    {
      id: "c16",
      parentCommentId: "c14",
      author: sampleAuthors[6],
      content:
        "У Голосієві добре, якщо зранку. Ввечері на доріжках уже тіснувато.",
      minutesAfterPost: 42,
      likesCount: 1,
    },
  ],
  t9: [
    {
      id: "c17",
      author: sampleAuthors[7],
      content:
        "У нас у школі поставили панелі на даху. Можу розпитати, як воно працює взимку.",
      minutesAfterPost: 19,
      likesCount: 3,
    },
    {
      id: "c18",
      author: currentUser,
      content: "Цікаво ще, скільки часу йде на обслуговування.",
      minutesAfterPost: 37,
    },
  ],
  t11: [
    {
      id: "c19",
      author: sampleAuthors[3],
      content: "А що з українського кіно порадите для першої зустрічі?",
      minutesAfterPost: 14,
      likesCount: 1,
    },
    {
      id: "c20",
      author: sampleAuthors[4],
      content: "О, нарешті привід дістати список «подивитись потім»",
      minutesAfterPost: 29,
    },
    {
      id: "c21",
      parentCommentId: "c19",
      author: sampleAuthors[5],
      content:
        "Я б почала з «Мої думки тихі». Нам після нього ще на годину розмов вистачило.",
      minutesAfterPost: 51,
      likesCount: 2,
    },
  ],
  t14: [
    {
      id: "c22",
      author: sampleAuthors[2],
      content:
        "За ліс. Уявіть: сигнал іде з дерева, якому триста років, а передавач усередині — з майбутнього",
      minutesAfterPost: 11,
    },
    {
      id: "c23",
      author: sampleAuthors[3],
      content:
        "Туманність! Екіпаж ловить сигнал, а це їхній власний голос із завтрашнього дня",
      minutesAfterPost: 25,
    },
    {
      id: "c24",
      parentCommentId: "c22",
      author: currentUser,
      content:
        "А кільця дерева — це журнал усіх попередніх повідомлень 👀",
      minutesAfterPost: 39,
    },
    {
      id: "c25",
      parentCommentId: "c23",
      author: sampleAuthors[7],
      content:
        "Беру цей сюжет. Тепер головне — не отримати від себе повідомлення з дедлайном 😅",
      minutesAfterPost: 52,
    },
  ],
};
