# React + Tailwind CSS + TypeScript + Vite

## 📌 TODO

- [✅] Налаштування
- [✅] Редагування профілю
- [✅] Окрема компонента для створення дописів
- [✅] Додавання медіа до дописів
  - [✅] GIF
  - [✅] Зображення
  - [✅] Відео
  - [✅] Автоматичні картки посилань
- [✅] Доробити дописи
  - [✅] Коментарі
  - [✅] Репости
  - [✅] Скільки переглядів набрав пост
  - [✅] При кліку на пост відкрити його окрему сторінку
- [✅] Можливість слідкувати за профілями
- [✅] Перегляд підписників та підписок
- [✅] Додати вкладки **Replies** та **Likes** до `FeedList`
- [✅] Зробити пошук функціональним
- [✅] Bookmarks
- [✅] Зробити функціональний toolbar в модальному вікні comment
- [✅] Зробити функціональний search filters
- [ ] Доробити алгоритми:
  - [ ] Популярне
  - [ ] Кого читати

## Link preview API

У live-режимі клієнт викликає `POST /api/link-previews/resolve` з тілом
`{ "url": "https://example.com/article" }`. Endpoint має повернути:

```json
{
  "id": "preview-id",
  "url": "https://example.com/article",
  "domain": "example.com",
  "title": "Article title",
  "imageUrl": "https://example.com/article-cover.jpg"
}
```

Якщо сторінка не має придатного зображення, `imageUrl` може бути `null`.

## Recommendations API

Праві картки та сторінка `/follow` використовують два авторизовані endpoint-и.

`GET /api/recommendations/trends?limit=4` повертає:

```json
{
  "items": [
    {
      "id": "trend-id",
      "title": "React 19",
      "context": "Технології · Популярне",
      "query": "React 19",
      "postsCount": 12700
    }
  ]
}
```

`postsCount` необов'язковий. `query` використовується для переходу до пошуку.

`GET /api/recommendations/users?category=people&limit=4&cursor=opaque-value`
повертає:

```json
{
  "items": [
    {
      "id": "user-id",
      "username": "username",
      "displayName": "Display name",
      "bio": "Profile biography",
      "avatarUrl": null,
      "location": null,
      "isVerified": false
    }
  ],
  "nextCursor": "next-opaque-value"
}
```

`category` приймає `people` або `creators`. Остання сторінка повертає
`nextCursor: null`. Cursor вважається непрозорим для клієнта; персоналізацію,
порядок і виключення поточного користувача визначає backend.
