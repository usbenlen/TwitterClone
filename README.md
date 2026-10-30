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
├── components/
│   ├── ui/             загальні UI-оболонки та іконки
│   ├── auth/           авторизація
│   ├── posts/          дописи, стрічка, коментарі й реакції
│   ├── composer/       редактор, вкладення, GIF, локації й опитування
│   ├── profiles/       профілі, користувачі та VerifiedBadge
│   ├── search/         пошук і фільтри
│   ├── recommendations/ рекомендації, тренди й огляд
│   ├── notifications/  сповіщення
│   ├── scheduling/     планування дописів
│   ├── reports/        скарги
│   ├── settings/       ThemeSwitch
│   ├── admin/          адміністрування й модерація
│   ├── navigation/     меню, сайдбари, заголовки й AppLogo
│   └── routing/        ProtectedRoute, GuestRoute, AdminRoute
├── hooks/              загальні хуки та групи auth, posts, composer тощо
├── api/                HTTP-клієнт, адаптери й endpoints
│   └── mappers/        перетворення запитів і відповідей
├── store/              Redux, єдиний appApi, RTK Query й сесія
│   └── posts/          запити дописів, кеш і координація реакцій
├── types/              спільні моделі, API-контракти й окремі *.dto.ts
├── constants/          обмеження, варіанти вибору й метадані UI
├── schemas/            Zod-схеми та виведені з них типи форм
├── utils/              загальні helpers, форматування й браузерні операції
│   ├── composer/       валідація, побудова payload і перетворення чернеток
│   ├── media/          підготовка, стиснення, кеш і перевірка медіа
│   └── posts/          дерево коментарів і оновлення авторів
├── config/             читання середовища й налаштування застосунку
├── pages/              сторінки маршрутів, включно з admin/
├── layouts/            лише макети сторінок
├── providers/          глобальні ефекти життєвого циклу
├── mock/               локальні handlers, fixtures і mock-сховища
├── main.tsx            точка входу
├── routes.tsx          маршрути та lazy imports сторінок
├── index.css           теми й глобальні стилі
└── vite-env.d.ts        декларації Vite
```

`components/ui` містить оболонки на кшталт Button, Input, Modal, Tooltip і Avatar. Вони отримують дані й callbacks через props та можуть керувати фокусом, відкриттям і відображенням. Авторизація, RTK Query й бізнес-дії належать прикладним компонентам і хукам. VerifiedBadge лежить у `components/profiles`, ThemeSwitch — у `components/settings`, AppLogo — у `components/navigation`.

Загальні браузерні хуки лежать безпосередньо в `hooks`; великі набори згруповані, наприклад `hooks/composer` і `hooks/posts`. Не створюємо підпапку для одного ізольованого хука чи однакову сітку функціональних груп у кожній категорії. API, типи й константи переважно пласкі. Усередині категорій не створюємо повторні `components/hooks/types` чи загальні `lib/model/common`.

HTTP-адаптери й мапери знаходяться в `api`, запити RTK Query, reducers, кеш і сесія — у `store`. Усі запити використовують єдиний `store/appApi.ts`; запити профілів, підписок, рекомендацій і планування залишаються окремими модулями. Типи моделей і контрактів зібрані в `types`: загальні — у `api.ts`, авторизація разом із refresh-відповіддю — в `auth.ts`, дописи — у `post.ts`. Серверні DTO відокремлені в `*.dto.ts` та не експортуються з адаптерів чи маперів. Props і приватні допоміжні типи залишаються біля реалізації; типи, виведені зі store та Zod-схем, — біля джерела.

У компонентах немає окремих файлів API, констант або helpers. Макети залишаються в `layouts`, а їхні меню, сайдбари й заголовки — у `components/navigation`. Сторінки залишаються в `pages`, глобальні ефекти — у `providers`. Mock API викликає локальні функції без HTTP-перехоплення. Тести лежать у локальних `__tests__` поруч із відповідною категорією коду.

| Що потрібно знайти | Де шукати |
|---|---|
| Маршрут або сторінку | `routes.tsx`, `constants/routes.ts`, `pages/` |
| Картку допису або його модель | `components/posts/PostCard.tsx`, `types/post.ts` |
| HTTP-операції та кеш дописів | `api/postApi.ts`, `store/posts/postQueries.ts`, `store/posts/postCache.ts` |
| Валідацію чи відправлення редактора | `utils/composer/composerRules.ts`, `utils/composer/composerPayload.ts`, `hooks/composer/useComposerSubmit.ts` |
| Коментарі, реакції, опитування | `components/posts/`, `hooks/posts/`, `utils/posts/` |
| Завантаження вкладень редактора | `hooks/composer/useMediaUpload.ts`, `utils/media/` |
| Підписки | `api/followApi.ts`, `store/followQueries.ts`, `hooks/profiles/useFollow.ts` |
| Транспорт, refresh токенів, помилки HTTP | `api/httpClient.ts`, `utils/tokenStorage.ts` |

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

HTTP-запити проходять через `src/api/httpClient.ts`; шляхи централізовано визначені в `src/api/apiEndpoints.ts`. Базова адреса утворюється як `VITE_PATH_TO_SERVER` + `VITE_PATH_TO_API`. Адаптери вибирають real або mock реалізацію, а UI працює зі спільними типами й моделями.

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
npm run test -- src/utils/composer/__tests__/composer.test.ts
npm run lint
npm run build
```

Для змін API, маперів, кешу чи сесій перевіряйте відповідні тести ширше; для UI також перевіряйте теми, клавіатурну взаємодію та мобільний вигляд.

## Розробка

- Для локальних імпортів у `src` використовуйте alias `@/`; для типів - `import type`.
- Для кількох компонентів або хуків з однієї групи використовуйте вибірковий `index.ts`, наприклад `import { Button, Input, Spinner } from "@/components/ui"`. Індекси містять явні іменовані реекспорти; default exports реалізацій зберігаються. Не використовуйте `export *`, ланцюжки індексів або загальний індекс застосунку.
- `@/components/posts` надає `PostHeader`, `PostActions`, `PostComments`, `PostContent` та інші явно перелічені компоненти. Усередині групи залишайте прямі імпорти, якщо індекс експортує поточний модуль або транзитивно залежить від нього. Це стосується й наявного зв’язку `PostCard ↔ PostComments`: групування імпортів не повинно створювати нові цикли.
- Спільні типи можна об’єднувати через `import type { Post, User, ComposerSubmitData } from "@/types"`; `types/index.ts` містить лише `export type`. Між файлами типів, для store, constants, utils, lazy imports сторінок і тестових моків зберігайте конкретні шляхи.
- Спочатку обирайте роль файлу, потім функціональну групу: `components/posts/PostCard.tsx`, `hooks/posts/usePostLike.ts`, `api/postApi.ts`, `types/post.ts`, `constants/composer.ts`. Нові сторінки додавайте до `pages`, маршрути — до `constants/routes.ts` і `routes.tsx`.
- Назва файлу має пояснювати роль: `PostCard.tsx`, `usePostComments.ts`, `postApi.ts` (адаптер), `postQueries.ts` (RTK Query), `types/post.ts`, `postMapper.ts`, `postCache.ts`.
- Спільні моделі та API-контракти зберігайте в `types`, серверні DTO — окремо від UI-моделей. Правила й payload редактора належать `utils/composer`, медіаоперації — `utils/media`, дерево коментарів — `utils/posts`. Mock-реалізації залишайте в `mock`.
- Власний код використовує назву `Post`. Наявні wire-поля, ключі сховищ і змінна `VITE_MAX_TWEET_LENGTH` збережені для сумісності.
- Повторно використовуйте спільні типи, константи, UI-примітиви, API-адаптери й composer helpers.
- Не дублюйте backend DTO як моделі UI: додавайте перетворення у відповідні мапери.
- Зберігайте актуальні API-контракти, перевірки сесії, інвалідацію RTK Query та поведінку mock API.
- Додавайте тести в модульну папку `__tests__`; назви тестів - `*.test.ts` або `*.test.tsx`.

## Пов’язані документи

- [.env-example](.env-example) - шаблон локальних змінних.
