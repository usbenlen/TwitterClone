# Chirp Live Demo
- Mock Demo (Admin Testing): https://chirp-mock.vercel.app
- Live Version: https://chirp-seven-sigma.vercel.app

Мок-демонстрація призначена для тестування та демонстрації. Жива версія використовує backend.

# Chirp Backend
- [Chirp backend repository](https://github.com/IvanZacerkovnij/ASP-React-FinalProject-server)

# Chirp - frontend

Chirp - вебзастосунок соціальної мережі у стилі Twitter. Цей репозиторій містить браузерний frontend на React і TypeScript. Він працює з backend API або з локальними mock-обробниками для розробки.

## Зміст

- [Можливості](#можливості)
- [Технології](#технології)
- [Структура проєкту](#структура-проєкту)
- [Локальний запуск](#локальний-запуск)
- [Конфігурація](#конфігурація)
- [Інтеграція з backend](#інтеграція-з-backend)
- [Google OAuth](#google-oauth)
- [Перевірки та тести](#перевірки-та-тести)
- [Розробка](#розробка)
- [Пов’язані документи](#повязані-документи)

## Можливості

- Реєстрація, вхід, підтвердження пошти, відновлення пароля та вхід через Google.
- Стрічка дописів, детальна сторінка допису, коментарі й вкладені відповіді, цитування, редагування та історія змін.
- Реакції: вподобання, репости, закладки й перегляди для дописів і коментарів.
- Створення дописів і коментарів із зображеннями, відео, GIF, опитуваннями, локаціями та попереднім переглядом посилань. Доступність окремих можливостей задається feature flags.
- Варіанти опитування підтримують emoji та одне необов'язкове фото біля кожної текстової відповіді.
- Профілі, редагування власного профілю, підписки, списки підписників і підписок.
- Пошук дописів і користувачів, рекомендації та закладки.
- Огляд: новини, популярні теми, спорт, розваги, рекомендовані автори й дописи. Вкладки на вузьких екранах прокручуються горизонтально.
- Заплановані дописи; планувальник не підтримує опитування й локації.
- Скарги на контент і адміністративна панель для користувачів із серверною роллю `Admin`.
- Світла, темна та системна теми; інтерфейс і повідомлення переважно українською, типова локаль - `uk-UA`.

## Технології

- React 19, TypeScript 6, Vite 8.
- React Router 8 із lazy loading сторінок.
- Redux Toolkit, RTK Query та React Redux для стану й кешу API.
- Tailwind CSS 4, Floating UI, Lucide React.
- React Hook Form і Zod для форм та валідації.
- Vitest і happy-dom для тестів.

Версії пакетів визначені в `package.json` та `package-lock.json`.

## Структура проєкту

```text
src/
├── app/
│   ├── router/         маршрути та lazy imports
│   ├── providers/      глобальні ефекти життєвого циклу
│   ├── store/          складання Redux store
│   └── styles/         глобальні стилі й теми
├── pages/              сторінки маршрутів
├── widgets/            макети, навігація, стрічка й композиції профілю
├── features/
│   ├── auth/           авторизація, Google OAuth та guards
│   ├── content/        дописи, коментарі, реакції, редактор і медіа
│   ├── profiles/       користувачі, профілі та підписки
│   ├── discovery/      пошук, рекомендації й тренди
│   ├── scheduling/     планування та публікація дописів
│   ├── moderation/     адміністрування, скарги й аналітика
│   ├── preferences/    налаштування теми
│   └── notifications/  сповіщення та їхні налаштування
├── shared/
│   ├── api/            HTTP-клієнт і endpoints
│   ├── config/         читання середовища та маршрути URL
│   ├── constants/      спільні обмеження й метадані
│   ├── hooks/          загальні браузерні хуки
│   ├── lib/            форматування, кеш зображень і browser helpers
│   ├── store/          єдиний appApi, сесія та типізовані Redux-хуки
│   ├── types/          загальні API-контракти й тема
│   └── ui/             UI-примітиви, AppLogo та іконки
├── mock/               локальні handlers, fixtures і сховища
├── main.tsx            точка входу
└── vite-env.d.ts        декларації Vite
```

Структура наслідує шари [еталонного проєкту](https://github.com/IvanZacerkovnij/ASP-React-FinalProject-UI/tree/701231c931bc6496f826a513ec98ed77d2023716). Поточні Redux Toolkit/RTK Query, mock API та всі фічі збережені.

`app` складає застосунок; `pages` компонують `widgets`, фічі та спільні модулі. У `widgets` розміщені макети, меню, сайдбари, заголовки, Feed/FeedList, композиція Profile та ExplorePosts. `features` групує реалізації за доменом, `shared` містить спільні можливості. Не створюємо порожніх папок.

У фічах HTTP-адаптери, окремі RTK Query-модулі та мапери належать `api`/`api/mappers`; reducers, кеш і координація реакцій — `model`; компоненти — `components`; хуки — `hooks`; моделі й окремі серверні DTO — `types`; правила та helpers — `lib`; обмеження — `constants`; схеми форм — `schemas`. Props і приватні типи залишаються біля реалізації.

`shared/ui` містить Button, Input, Modal, Tooltip, Avatar та AppLogo. VerifiedBadge належить `features/profiles/components`, ThemeSwitch — `features/preferences/components`, а MediaGrid/MediaItem/MediaViewer — `features/content/components/media`. Редакторні діалоги планування лежать у `features/content/components/composer/schedule`; API та стан планування — у `features/scheduling`.

Спільні браузерні хуки лежать у `shared/hooks`; пов'язані хуки редактора й дописів — у `features/content/hooks/composer` і `features/content/hooks/posts`. Усі запити розширюють єдиний `shared/store/appApi.ts`; `app/store/store.ts` збирає reducers і підключає endpoints. Mock API залишається прямим викликом локальних функцій.

Це структурне перенесення зі збереженням реалізацій: наявні міждоменні залежності залишилися. Типізовані хуки `shared/store` імпортують типи store з `app`, HTTP-клієнт — тип refresh-відповіді з auth. Збережені наявні циклічні зв'язки PostCard ↔ PostComments та редактора з діалогами планування; використовуємо прямі імпорти, щоб не розширювати ці цикли фасадами.

Тести лежать у локальних `__tests__` біля відповідного коду. Спільні перевірки кількох доменів — у `app/__tests__`.

| Що потрібно знайти | Де шукати |
|---|---|
| Маршрути й URL | `app/router/routes.tsx`, `shared/config/routes.ts` |
| Дописи, коментарі, редактор і медіа | `features/content/` |
| Запити та кеш дописів | `features/content/api/postQueries.ts`, `features/content/model/postCache.ts` |
| Профілі та підписки | `features/profiles/`, `widgets/profile/` |
| Пошук і рекомендації | `features/discovery/`, `widgets/discovery/` |
| Транспорт і токени | `shared/api/httpClient.ts`, `shared/lib/tokenStorage.ts` |

Основні маршрути: `/` (landing), `/login`, `/register`, `/home`, `/explore`, `/search`, `/post/:postId`, `/:username`, `/:username/followers`, `/:username/following`, `/bookmarks`, `/follow`, `/settings`, `/admin`. `/admin` додатково перевіряє серверну роль `Admin` і стан облікового запису.

## Локальний запуск

Потрібен Node.js, сумісний із встановленими версіями Vite та TypeScript, і npm.

```sh
npm ci
```

Скопіюйте `.env-example` у локальний `.env`, за потреби задайте конфігурацію за інструкцією нижче, а потім запустіть dev-сервер:

```sh
npm run dev
```

Vite за замовчуванням відкриває застосунок на `http://localhost:5173`. Доступні команди:

```sh
npm run build    # перевірка TypeScript і production-збірка у dist/
npm run preview  # локальний перегляд зібраного dist/
npm run lint     # ESLint
npm run test     # Vitest, одноразовий запуск усіх тестів
```

## Конфігурація

Єдиний шаблон локальної конфігурації - [.env-example](.env-example). Значення `VITE_` вбудовуються у frontend і доступні в браузері: не зберігайте в них паролі, приватні ключі чи інші серверні секрети. Після зміни змінних перезапустіть dev-сервер або створіть нову production-збірку.

| Змінна | Типове значення | Призначення |
|---|---|---|
| `VITE_APP_NAME` | `Chirp` | Назва застосунку в інтерфейсі та HTML. |
| `VITE_APP_LOCALE` | `uk-UA` | Локаль дат і локалізованих чисел. |
| `VITE_PATH_TO_SERVER` | `https://localhost:7001/` у прикладі | Origin backend-сервера. |
| `VITE_PATH_TO_API` | `api/` у прикладі | Префікс API; об’єднується з адресою сервера. |
| `VITE_USE_MOCK` | `false` | `true` перемикає адаптери на локальні mock-обробники. |
| `VITE_MOCK_USER_ROLE` | `USER` | Mock-режим: `USER` або `ADMIN`; не надає прав на реальному сервері. |
| `VITE_GOOGLE_CLIENT_ID` | порожньо | OAuth Client ID типу Web application; без нього Google-вхід вимкнено. |
| `VITE_MAX_TWEET_LENGTH` | `280` | Максимальна довжина тексту допису за кодовими точками Unicode. |
| `VITE_MAX_NAME_LENGTH` | `100` | Максимальна довжина імені профілю. |
| `VITE_MAX_BIO_LENGTH` | `160` | Максимальна довжина біографії. |
| `VITE_MAX_MEDIA_ATTACHMENTS` | `4` | Максимальна кількість медіавкладень. GIF може бути лише одним вкладенням; медіа не поєднується з опитуванням. |
| `VITE_MAX_IMAGE_SIZE_MB` | `10` | Максимальний розмір зображення. |
| `VITE_MAX_VIDEO_SIZE_MB` | `100` | Максимальний розмір відео. |
| `VITE_MAX_GIF_SIZE_MB` | `10` | Максимальний розмір GIF. |
| `VITE_IMAGE_MAX_WIDTH` | `2048` | Максимальна ширина зображення після підготовки. |
| `VITE_IMAGE_QUALITY` | `0.8` | Якість стиснення зображення від більшого за 0 до 1 включно. |
| `VITE_ENABLE_IMAGE_UPLOAD` | `true` у прикладі | Увімкнути завантаження зображень. |
| `VITE_ENABLE_VIDEO_UPLOAD` | `true` у прикладі | Увімкнути завантаження відео. |
| `VITE_ENABLE_LINK_PREVIEWS` | `true` у прикладі | Увімкнути попередній перегляд посилань. |
| `VITE_ENABLE_GIFS` | `true` у прикладі | Увімкнути GIF. |
| `VITE_ENABLE_POLLS` | `true` у прикладі | Увімкнути опитування. |
| `VITE_ENABLE_LOCATION` | `true` у прикладі | Увімкнути локації. |

Числові обмеження мають бути скінченними й додатними; для довжин, кількості вкладень і ширини потрібні цілі числа. `VITE_IMAGE_QUALITY` не може перевищувати 1. Feature flags вважаються увімкненими лише зі значенням `true`.

### Mock-режим

Встановіть `VITE_USE_MOCK=true`, щоб користуватися mock API без HTTP-запитів до backend. За потреби для локального перегляду адмін-панелі задайте `VITE_MOCK_USER_ROLE=ADMIN`, перезапустіть Vite та увійдіть у mock-акаунт. Значення ролі не є перевіркою серверної авторизації. Частина mock-можливостей може відрізнятися від real API; mock-сумісність не підтверджує сумісність із сервером.

## Інтеграція з backend

HTTP-запити проходять через `src/shared/api/httpClient.ts`; шляхи централізовано визначені в `src/shared/api/apiEndpoints.ts`. Базова адреса утворюється як `VITE_PATH_TO_SERVER` + `VITE_PATH_TO_API`. Адаптери вибирають real або mock реалізацію, а UI працює зі спільними типами й моделями.

Клієнт додає Bearer access token, а на `401` спільно для паралельних запитів оновлює пару access/refresh token і повторює запит один раз. Помилки API зберігають HTTP-статус, payload і `Retry-After`; для помилок RFC 7807 UI використовує серверне повідомлення. Запити з `FormData` не встановлюють multipart Content-Type вручну. Успішний `204` повертає `undefined`.

Контракти колекцій відрізняються між endpoint-ами. Курсори real API непрозорі; mock API може використовувати offset-значення. Не вважайте mock-контракти або застарілі integration notes доказом поточного серверного контракту. Поточні межі реальної інтеграції:

- Рекомендації використовують `recommendations/trends`, `recommendations/users` і `recommendations/posts`. Автори та дописи підтримують курсорну пагінацію; дописи перетворюються через наявний mapper. Помилки API відображаються з повторною спробою без підміни mock-даними.
- real-адаптер запланованих дописів `publishDue()` повертає порожній список; публікація за розкладом має підтримуватися backend.
- Mock підтримує окремі сценарії, які можуть бути недоступні на сервері, зокрема певні варіанти редагування опитувань і контенту без тексту. Для backend-обмежень UI має зберігати вміст редактора й показувати помилку сервера.

Backend має дозволити CORS-запити з frontend-origin, а браузер має мати доступ до API через HTTPS для production. Frontend не містить backend-секретів і не замінює серверну авторизацію.

## Google OAuth

Для Google-входу задайте `VITE_GOOGLE_CLIENT_ID` - OAuth Client ID типу Web application. Звичайна авторизація працює і без нього. У Google Cloud Console додайте точний URI - `<frontend-origin>/auth/google/callback` до **Authorized redirect URIs**. Для локального Vite типовий URI - `http://localhost:5173/auth/google/callback`; `localhost` і `127.0.0.1` для OAuth є різними адресами. У production потрібен HTTPS. Frontend і backend мають використовувати той самий Google Client ID; Client Secret залишається лише на сервері.

Callback URL обчислюється з origin сторінки, окрема змінна середовища не потрібна. Після повернення від Google frontend очищує URL fragment і передає ID token до backend для входу або прив’язки. У mock-режимі обмін токена лише імітується локально й не перевіряє підпис Google.

## Перевірки та тести

Тести розташовані в `__tests__` папках поруч із кодом, поведінку якого перевіряють. DOM-тести використовують happy-dom локально; тестове середовище за замовчуванням — Node.

```sh
npm run test
npm run test -- src/features/content/lib/composer/__tests__/composer.test.ts
npm run lint
npm run build
```

Для змін API, маперів, кешу чи сесій перевіряйте відповідні тести ширше; для UI також перевіряйте теми, клавіатурну взаємодію та мобільний вигляд.

## Розробка

- Спочатку обирайте шар і домен, потім роль файлу: `features/content/components/posts/PostCard.tsx`, `features/content/api/postApi.ts`, `features/content/model/postCache.ts`.
- Для локальних імпортів у `src` використовуйте `@/`; для типів — окремі `import type`. Порядок груп: зовнішні залежності, локальні значення за шарами app/pages/widgets/features/shared/mock, типи, побічні імпорти. Усередині груп сортуйте шляхи й іменовані імпорти; порядок побічних імпортів зберігайте.
- Для кількох споріднених експортів використовуйте вибірковий `index.ts`, наприклад `import { Button, Input, Spinner } from "@/shared/ui"`. Індекси містять явні реекспорти; default exports реалізацій збережені. Не використовуйте `export *`, ланцюжки індексів або загальний індекс застосунку.
- Імпорти всередині груп залишайте прямими, якщо фасад експортує поточний модуль або транзитивно залежить від нього. Для Redux, утиліт, констант, lazy imports та тестових моків використовуйте конкретні модулі. Об'єднуйте типи через доменні `types/index.ts`, які містять лише `export type`.
- Сторінки належать `pages`, композиції та макети — `widgets`, глобальні ефекти — `app/providers`. Нові маршрути додавайте в `shared/config/routes.ts` і `app/router/routes.tsx` зі збереженням lazy loading.
- Спільні моделі та контракти фіч зберігайте в їхніх `types`, серверні DTO — окремими `*.dto.ts`. Правила редактора належать `features/content/lib/composer`, медіаоперації — `features/content/lib/media`, дерево коментарів — `features/content/lib/posts`; загальний кеш зображень та object URL — `shared/lib`.
- Використовуйте єдиний `shared/store/appApi.ts`; підтримуйте окремі доменні queries, інвалідацію, оптимістичний rollback і перевірки сесії. Mock-реалізації залишайте в `mock`.
- Назви реалізацій, зокрема Post, збережені; wire-поля, ключі сховищ і `VITE_MAX_TWEET_LENGTH` не змінені. Повторно використовуйте чинні компоненти, типи, константи та helpers.
- Тести додавайте до локальної папки `__tests__` з назвами `*.test.ts` або `*.test.tsx`.

## Пов’язані документи

- [.env-example](.env-example) - шаблон локальних змінних.
