import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_PREFERENCE_KEYS,
} from "@/constants/notifications";

import { currentUser, sampleAuthors } from "@/mock/data/users";
import { tweets } from "@/mock/data/tweets";
import { commentsByPostId } from "@/mock/data/comments";
import { delay } from "@/mock/utils/delay";

import { toUserShort } from "@/utils/user";

import type {
  ChirpNotification,
  NotificationPreferences,
  NotificationsApi,
  NotificationTarget,
  NotificationType,
} from "@/types/notification";
import type { UserShort } from "@/types/user";

export interface MockNotificationEvent {
  id: string;
  type: NotificationType;
  actor: UserShort;
  target: NotificationTarget | null;
  createdAt: string;
  isMention?: boolean;
}

interface PersistedNotifications {
  preferences: NotificationPreferences;
  read: Record<string, number>;
}

// Each instance belongs to one recipient. Cursors and read markers are internal
// mock tokens; callers pass them unchanged, just as they do with server tokens.
export function createMockNotificationsApi(
  recipientId: string,
  seeds: MockNotificationEvent[],
  storage?: Pick<Storage, "getItem" | "setItem">,
): NotificationsApi & { add(event: MockNotificationEvent): void } {
  const key = `chirp:notifications:${recipientId}:v1`;
  let state: PersistedNotifications = {
    preferences: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    read: {},
  };
  try {
    const saved = JSON.parse(storage?.getItem(key) ?? "null") as PersistedNotifications | null;
    if (saved) {
      for (const pref of Object.keys(state.preferences) as (keyof NotificationPreferences)[]) {
        if (typeof saved.preferences?.[pref] === "boolean") state.preferences[pref] = saved.preferences[pref];
      }
      state.read = Object.fromEntries(
        Object.entries(saved.read ?? {}).filter(
          ([, value]) => Number.isInteger(value) && value >= 0,
        ),
      );
    }
  } catch {
    /* Private browsing or invalid saved data: keep an in-memory inbox. */
  }

  const events: (MockNotificationEvent & { sequence: number })[] = [];
  const persist = () => {
    try {
      storage?.setItem(key, JSON.stringify(state));
    } catch {
      /* Keep in-memory changes. */
    }
  };
  const groupId = (event: MockNotificationEvent) =>
    event.type === "like" || event.type === "repost"
      ? JSON.stringify([
          event.type,
          event.target?.type,
          event.target?.id,
          event.createdAt.slice(0, 10),
        ])
      : event.id;

  const add = (event: MockNotificationEvent, seed = false) => {
    if (event.actor.id === recipientId || events.some((item) => item.id === event.id))
      return;
    if (!seed && !state.preferences[NOTIFICATION_PREFERENCE_KEYS[event.type]])
      return;

    if (
      (event.type === "like" || event.type === "repost") &&
      events.some(
        (item) => groupId(item) === groupId(event) && item.actor.id === event.actor.id,
      )
    )
      return;
    events.push({ ...structuredClone(event), sequence: events.length + 1 });
  };
  seeds.forEach((event) => add(event, true));

  const throughSequence = (token: string) => {
    if (!/^mock:\d+$/.test(token)) throw new Error("Некоректний маркер сповіщень");

    const value = Number(token.slice(5));
    if (value > events.length) throw new Error("Некоректний маркер сповіщень");

    return value;
  };
  const groups = (through = events.length): ChirpNotification[] => {
    const grouped = new Map<string, typeof events>();

    for (const event of events.filter((item) => item.sequence <= through)) {
      const id = groupId(event);
      grouped.set(id, [...(grouped.get(id) ?? []), event]);
    }

    return [...grouped]
      .map(([id, items]) => {
        const recent = [...items].sort(
          (a, b) =>
            b.createdAt.localeCompare(a.createdAt) || b.sequence - a.sequence,
        );
        const latest = recent[0];
        const actors = [
          ...new Map(
            recent.map((item) => [item.actor.id, item.actor]),
          ).values(),
        ];

        return {
          id,
          type: latest.type,
          actors: actors.slice(0, 3),
          actorCount: actors.length,
          target: latest.target,
          createdAt: recent.at(-1)!.createdAt,
          updatedAt: latest.createdAt,
          isRead: items.every((item) => item.sequence <= (state.read[id] ?? 0)),
          isMention: items.some(
            (item) => item.isMention || item.type === "mention",
          ),
        };
      })
      .sort(
        (a, b) =>
          b.updatedAt.localeCompare(a.updatedAt) || b.id.localeCompare(a.id),
      );
  };

  return {
    add: (event) => add(event),
    async list(tab, limit, cursor) {
      await delay();
      if (
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 50 ||
        !["all", "mentions"].includes(tab)
      )
        throw new Error("Некоректні параметри сповіщень.");
      let offset = 0;
      let readThrough = `mock:${events.length}`;
      if (cursor) {
        let parsed: { offset: number; readThrough: string; tab: string };
        try {
          parsed = JSON.parse(cursor);
        } catch {
          throw new Error("Некоректний курсор сповіщень.");
        }

        if (
          !parsed ||
          !Number.isInteger(parsed.offset) ||
          parsed.offset < 0 ||
          parsed.tab !== tab
        )
          throw new Error("Некоректний курсор сповіщень.");
        offset = parsed.offset;
        readThrough = parsed.readThrough;
      }

      const items = groups(throughSequence(readThrough)).filter((item) => tab === "all" || item.isMention);
      const hasMore = offset + limit < items.length;
      return structuredClone({
        items: items.slice(offset, offset + limit),
        hasMore,
        readThrough,
        nextCursor: hasMore
          ? JSON.stringify({ offset: offset + limit, readThrough, tab })
          : null,
      });
    },

    async unreadCount() {
      await delay();
      return { count: groups().filter((item) => !item.isRead).length };
    },

    async read(id, readThrough) {
      await delay();
      const through = throughSequence(readThrough);

      if (!events.some((item) => groupId(item) === id)) throw new Error("Сповіщення не знайдено.");

      state.read[id] = Math.max(state.read[id] ?? 0, through);
      persist();
    },
    async readAll(readThrough) {
      await delay();
      const through = throughSequence(readThrough);

      for (const event of events) {
        if (event.sequence > through) continue;
        const id = groupId(event);
        state.read[id] = Math.max(state.read[id] ?? 0, through);
      }

      persist();
    },
    async preferences() {
      await delay();
      return { ...state.preferences };
    },

    async updatePreferences(patch) {
      await delay();
      if (
        Object.entries(patch).some(
          ([name, value]) =>
            !Object.hasOwn(DEFAULT_NOTIFICATION_PREFERENCES, name) ||
            typeof value !== "boolean",
        )
      )
        throw new Error("Некоректні налаштування сповіщень.");
      state = { ...state, preferences: { ...state.preferences, ...patch } };
      persist();
      return { ...state.preferences };
    },
  };
}

function fixtureEvents(now: number): MockNotificationEvent[] {
  const authors = sampleAuthors.filter((user) => user.id !== currentUser.id);
  const comments = Object.values(commentsByPostId).flat();
  const ownContent = [...tweets, ...comments].filter((item) => item.author.id === currentUser.id);
  const types: NotificationType[] = [
    "reply",
    "like",
    "follow",
    "mention",
    "repost",
    "quote",
  ];

  const result: MockNotificationEvent[] = [];

  for (let index = 0; index < 36; index++) {
    const type = types[index % types.length];
    const incoming =
      type === "reply"
        ? comments.filter((item) => item.author.id !== currentUser.id)
        : tweets.filter((item) => item.author.id !== currentUser.id);

    const content = (
      type === "like" || type === "repost" ? ownContent : incoming
    )[
      index %
        (type === "like" || type === "repost"
          ? ownContent.length
          : incoming.length)
    ];

    const event: MockNotificationEvent = {
      id: `notification-${index}`,
      type,
      actor: toUserShort(authors[index % authors.length]),
      target:
        type === "follow" || !content
          ? null
          : {
              type: content.isComment ? "comment" : "post",
              id: content.id,
              preview: content.content || null,
            },
      createdAt: new Date(now - index * 7_200_000).toISOString(),
      isMention: type === "mention" || (type === "reply" && index % 12 === 0),
    };

    result.push(event);

    if (type === "like" || type === "repost") {
      result.push({
        ...event,
        id: `${event.id}-second`,
        actor: toUserShort(authors[(index + 1) % authors.length]),
      });
    }
  }
  // Sequence order follows arrival order, oldest first.
  return result.reverse();
}

let instance: NotificationsApi;
function inbox() {
  if (!instance) {
    let storage: Storage | undefined;
    try {
      storage = globalThis.localStorage;
    } catch {
      /* Storage may be disabled. */
    }
    let seededAt = Date.now();
    try {
      const key = `chirp:notifications:${currentUser.id}:seeded-at`;
      const saved = Number(storage?.getItem(key));
      if (Number.isFinite(saved) && saved > 0) seededAt = saved;
      else storage?.setItem(key, String(seededAt));
    } catch {
      /* Keep fixtures usable without browser storage. */
    }
    instance = createMockNotificationsApi(
      currentUser.id,
      fixtureEvents(seededAt),
      storage,
    );
  }
  return instance;
}

export const mockNotificationsApi: NotificationsApi = {
  list: (...args) => inbox().list(...args),
  unreadCount: () => inbox().unreadCount(),
  read: (...args) => inbox().read(...args),
  readAll: (...args) => inbox().readAll(...args),
  preferences: () => inbox().preferences(),
  updatePreferences: (patch) => inbox().updatePreferences(patch),
};
