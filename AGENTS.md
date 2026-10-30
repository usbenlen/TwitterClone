# Agent instructions for TwitterClone

# .env

I am not allowing you to open, view or edit the .env file.

## Purpose and scope

These instructions apply to the entire repository. Use them when implementing,
reviewing, testing, or documenting changes. Follow explicit task instructions and
any more specific instructions in the directory being changed.

Read the relevant implementation and nearby tests before editing. Treat current
code and configuration as the source of truth for frontend behavior. Distinguish
existing behavior from proposals and dated backend integration notes.

Keep changes focused on the requested outcome. Preserve unrelated work, including
untracked documentation. Do not introduce architectural rewrites, dependency
upgrades, repository-wide formatting, or new infrastructure as incidental cleanup.

## Project overview

TwitterClone is the repository/package name; the application's default display
name is **Chirp**. This repository contains the browser frontend, not the backend.
It supports authentication, feeds, posts, comment threads, quotes, reactions,
bookmarks, profiles, follows, search, recommendations, scheduled posts, reports,
and an administration area.

The stack is React 19, TypeScript 6, Vite 8, Tailwind CSS 4, React Router 8,
Redux Toolkit with RTK Query, React Hook Form with Zod, and Vitest. Floating UI
supports overlays; media utilities use browser-image-compression. Check
[package.json](package.json) for current versions rather than copying this list
into dependency constraints.

The interface and validation messages are primarily Ukrainian. Preserve that
language and existing wording conventions when adding user-facing text. Code
identifiers remain English. Dates and locale-aware numbers use application locale
configuration, whose default is `uk-UA`.

## Repository map

Use the app/pages/widgets/features/shared layers. Choose the owning domain,
then the file's role. The reference is
[ASP-React-FinalProject-UI](https://github.com/IvanZacerkovnij/ASP-React-FinalProject-UI/tree/701231c931bc6496f826a513ec98ed77d2023716).
This checkout retains Redux Toolkit/RTK Query, mock mode and all existing features.

```text
src/
├── app/                router/, providers/, store/, styles/, __tests__/
├── pages/              route screens, including admin and notifications
├── widgets/            layouts, navigation, feed, profile and discovery compositions
├── features/
│   ├── auth/           authentication, Google OAuth and access guards
│   ├── content/        posts, comments, reactions, composer, polls and media
│   ├── profiles/       users, editing and follows
│   ├── discovery/      search, recommendations, trends and feedback
│   ├── scheduling/     scheduled API, queries, state and publication
│   ├── moderation/     administration, reports, analytics and AdminRoute
│   ├── preferences/    theme selection and state
│   └── notifications/  inbox, preferences, queries and polling hooks
├── shared/             api/, config/, constants/, hooks/, lib/, store/, types/, ui/
├── mock/               local handlers, fixtures and persistence
├── main.tsx            entry point
└── vite-env.d.ts
```

Features use api (including RTK Query), api/mappers, components, hooks, model,
types, constants, schemas and lib only where implementations require them.
Reducers, cache and reaction coordination belong in model. Tests remain in
local __tests__ directories; mixed-domain tests belong in app/__tests__.
Consult [README.md](README.md) for the full map and mock admin setup.

## Setup and commands

Use npm and preserve `package-lock.json`. Do not introduce another package manager
or lockfile. No explicit Node engine requirement is declared in `package.json`;
use a Node version supported by the installed toolchain.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies from the committed lockfile when installation is needed |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run `tsc -b` and create the Vite production build |
| `npm run lint` | Run ESLint without rewriting files |
| `npm run test` | Run the Vitest suite once |
| `npm run test -- src/features/content/lib/composer/__tests__/composer.test.ts` | Run a specific test file |
| `npm run preview` | Serve an existing production build locally |

Prettier is installed, but there is no formatting npm script. Follow the style of
the edited file; avoid making an unrelated formatting pass.

Use [.env-example](.env-example) as the setup reference. Do not open, view or edit
the local `.env`; preserve existing local values. Never commit or print
tokens, passwords, or private environment contents. Variables prefixed `VITE_`
are exposed to the browser and must not contain server secrets.

- Backend URL: `VITE_PATH_TO_SERVER` plus `VITE_PATH_TO_API`.
- Mock mode: `VITE_USE_MOCK=true`; otherwise adapters use the real server.
- Mock admin: set `VITE_MOCK_USER_ROLE=ADMIN`, restart Vite and sign in.
  The default mock value is `USER`; these normalize to `Admin` and `User`.
- Identity: `VITE_APP_NAME` and `VITE_APP_LOCALE` have defaults `Chirp` and `uk-UA`.
- Tweet/profile/media limits and image compression settings are read centrally.
- Feature flags cover image/video upload, link previews, GIFs, polls and location.
  Existing flag readers enable a feature only for the string `"true"`.

Numeric environment validation lives in [src/shared/config/env.ts](src/shared/config/env.ts)
and runs during Vite configuration and application constant initialization.
Preserve positive/finite checks, integer requirements and the image quality range.
When adding an environment setting, update its reader, consumers, example and
relevant declarations/tests. Do not scatter new `import.meta.env` parsing into UI.

## Code conventions and module boundaries

- Choose the layer, domain and role. Keep domain implementations together in
  features/auth, content, profiles, discovery, scheduling, moderation, preferences
  or notifications; do not introduce empty category folders or duplicate helpers.
- Keep route screens in pages, layouts and reusable application compositions in
  widgets, global effects in app/providers, router configuration in app/router,
  global styles in app/styles and store assembly in app/store.
- widgets/feed owns Feed and FeedList; widgets/profile owns Profile and its
  header/hero/info/stats/tabs and FollowNavigation; widgets/discovery owns
  ExplorePosts. Navigation belongs in widgets/navigation, with admin and
  information navigation beside their corresponding layouts.
- Keep generic UI wrappers and icons in shared/ui. Data and callbacks arrive
  through props; local focus, opening and display state are allowed. AppLogo is
  shared/ui; VerifiedBadge belongs to profiles/components; ThemeSwitch belongs
  to preferences/components. Domain media components belong to content/components/media.
- Generic browser hooks belong in shared/hooks. Domain hooks belong to the feature,
  with substantial composer and posts groups inside content/hooks. Do not create
  a folder for one isolated hook. useNavigation stays with widgets/navigation.
- HTTP adapters, mappers and separate RTK Query modules belong to each feature's
  api. Use the single shared/store/appApi.ts. Keep profile, follow, recommendation
  and scheduling queries separate; reducers and cache helpers belong to model.
- Keep domain models and API contracts in feature types, with server DTOs in
  separate *.dto.ts files. Shared API contracts and theme definitions are in
  shared/types. Keep component Props and private helper types near implementation,
  and store/schema-derived types near their source. Do not export shared DTOs
  from adapters or mappers.
- Composer rules and payloads belong in content/lib/composer, media preparation
  in content/lib/media, comment trees in content/lib/posts. Common formatting,
  browser operations, IndexedDB, image caching and object URLs belong in shared/lib.
  Scheduled-date rules belong to scheduling/lib. All mock implementations remain in mock.
- App composes pages, widgets and features; widgets compose features and shared.
  This was a structural migration: retain existing cross-feature dependencies
  rather than rewriting behavior incidentally. Known exceptions are type-only
  shared/store/hooks imports of app store types, the shared transport's auth
  refresh-response type, and feature adapters' imports of mock implementations.
  Existing PostCard/PostComments and composer/scheduled-dialog runtime cycles
  remain; use direct imports and do not expand them through barrels.
- Use selective index.ts facades for related component, hook, API and type groups
  when consumers combine sibling exports. Use explicit named re-exports, including
  default aliases; preserve implementation exports. Do not use export *, chained
  facades, application-wide API/types barrels or old-path compatibility modules.
- Keep imports direct inside a group whenever its facade exports the importer or
  transitively depends on it. Redux modules, constants, utilities, lazy page imports
  and test mocks use concrete paths. Domain types/index.ts files contain only
  explicit export type declarations; imports between type implementations stay direct.
- Within src, use @/ for local imports, dynamic imports and Vitest/Jest mock paths.
  Use separate import type declarations. Group external values, local values by
  app/pages/widgets/features/shared/mock, types, then side-effect imports. Sort
  module paths and named bindings within groups; preserve side-effect import order.
- Match surrounding implementation formatting. Import blocks use double quotes,
  semicolons and multiline trailing commas. Avoid unrelated formatting changes.
  Components use PascalCase, hooks use use..., helpers use descriptive camelCase.
- Respect verbatimModuleSyntax, unused-variable checks and erasableSyntaxOnly.
  The current configs do not explicitly enable strict; do not describe it as a
  current requirement or change compiler settings as incidental cleanup.
- Use descriptive role names such as postApi.ts, postQueries.ts, postMapper.ts
  and postCache.ts. Internal content names use Post. Preserve wire fields,
  storage keys and environment names such as VITE_MAX_TWEET_LENGTH.
- Reuse domain types, constants, route strings and endpoints. Keep JSX focused
  on rendering and interaction; put orchestration in hooks, adaptation in api,
  cache behavior in model and reusable calculations in lib or schemas.
- Preserve existing exports: route pages commonly use default exports and shared
  helpers/components commonly use named exports. Reuse React Hook Form and Zod
  patterns and derive form types with z.infer where schemas already exist.

## API adapters and backend compatibility

Use [src/shared/api/httpClient.ts](src/shared/api/httpClient.ts) for application HTTP operations and
`ENDPOINTS` from `src/shared/api/apiEndpoints.ts` for endpoint paths. Feature adapters choose
real or mock implementations through `MOCK_ENABLED`; components should consume
the shared interfaces rather than branch on mock mode themselves.

Preserve these HTTP client behaviors when changing transport code:

- Bearer-token attachment except for requests explicitly using `skipAuth`.
- A shared refresh promise for concurrent 401 responses and one request retry.
- Rotation of both access and refresh tokens and the unauthorized-handler lifecycle.
- RFC 7807 ProblemDetails messages, status and payload in `ApiError`, and
  `Retry-After` propagation for rate-limit handling.
- `undefined` for successful 204 responses, and existing JSON/text response handling.
- JSON serialization for ordinary bodies. Let the browser set multipart headers
  for FormData; media uploads currently use the field name `File`.

Keep backend DTOs separate from UI domain models through the existing mappers.
Do not assume a backend post/comment response is already a frontend `Post`.
Request mappers also implement edit/removal semantics and poll time conversion.

Collection contracts differ by endpoint. Preserve cursor envelopes
`{ items, nextCursor, hasMore }`, mixed activity envelopes with `posts` and
`comments`, the array feed, and numbered admin pagination where currently used.
Real cursors are opaque; do not invent offset arithmetic for them. Several current
adapters expose only a page's items to callers, so accepting a cursor envelope does
not imply that every screen loads all pages. The follow adapter accepts either an
array or an `items` envelope and returns `UserShort[]` from a single response; it
does not currently walk cursor pages. Preserve wire contracts when adding pagination.

If present, consult `BACKEND_API_CHANGES.md`, `BACKEND_API_CHANGES_added.md` and
`MOCK_API.md` for integration context. These documents may be untracked in a
checkout. Their dated backend observations are not live server verification, and
mock examples do not override the real adapter's wire format.

Mock mode calls local handler functions directly; it is not an HTTP interception
layer. Preserve its public interfaces and persistence behavior. The RTK Query
request wrapper clones mock results to keep mutable fixtures separate from cache.
When adding a capability, update affected types, real adapter/mappers, mock handler
and tests together; identify backend work that remains necessary.

Mock features and real-server support can differ. Existing integration notes
describe gaps around poll editing and content without text. Preserve useful
frontend capabilities and show server errors while retaining editor contents.
Do not silently substitute mock data when real requests fail. Real trends, user
recommendations and post recommendations use their respective recommendation
endpoints. User and post recommendations accept opaque cursors; mock
recommendations have their own implementation. Preserve normal error/retry UI;
dated notes about recommendation routes or special 404 handling do not describe
these current adapters.

## Redux, RTK Query and session safety

The shared `appApi` uses `fakeBaseQuery` and the `request` wrapper around API
adapters. Posts, profiles, follows, recommendations, scheduling, notifications,
reports and admin queries inject endpoints into this API. Extend the existing
pattern rather than introducing a parallel server
state cache. Use typed hooks from `src/shared/store/hooks.ts` and the existing store types.
Use `createAppStore()` when a test needs an isolated store.

- Maintain query tags and invalidation for affected entities and lists. Profile
  edits, follows, content deletion and moderation can affect multiple screens.
- Reuse cache helpers to update all cached occurrences, including thread targets,
  ancestors and replies. Updating only the visible card leaves other views stale.
- Identify content by both target type and ID. `post:123` and `comment:123` are
  distinct entities; reuse `targetOf`, `targetKey`, `matches` and related tags.
- Preserve optimistic reaction updates, server reconciliation and failure rollback.
  Keep reaction-key coordination so repeated clicks cannot submit the same pending
  action concurrently. Counts must remain nonnegative.
- Keep session-generation checks around async work that writes auth or cached data.
  `sessionChanged` increments the generation, aborts running RTK Query operations
  and resets API state. A previous session's completion must not update a new one.
- Preserve cleanup of global unauthorized handlers, listeners, timers and pending
  browser effects. Avoid introducing another competing authentication bootstrap.

Authentication is coordinated by auth state, `useAuth`, token storage and
`AppEffects`. Keep `ProtectedRoute` and `GuestRoute` loading/redirect behavior.
Admin routes require the normalized server role `Admin` and an unblocked user.
Do not infer administrative privileges from usernames or UI state; the mock role
setting is only for mock mode. Server authorization remains authoritative.

## Composer, polls, media and scheduling

Reuse [src/features/content/lib/composer/composerRules.ts](src/features/content/lib/composer/composerRules.ts), composer payload
helpers and the decomposed composer hooks across posts, comments, quotes and edits.
Do not reimplement slightly different validation in each modal.

- Count text with `countCharacters`, which uses `Array.from` for Unicode code points.
  Do not replace it with UTF-16 `string.length` or assume it counts grapheme clusters.
- Default text length is 280 and attachment limit is four; both are configurable.
  A GIF must be the only media attachment. Media and a poll cannot coexist.
- Poll rules currently require 2–4 filled options, at most 25 code points per option,
  and an integer duration of 5–10080 minutes. Read the shared constants.
- Do not require text for every valid content combination. Use existing composer
  validity checks and preserve supported attachment/poll/location-only workflows.
- Submission requires uploaded attachments with attachment IDs. Preserve busy,
  upload-error and unsuccessful-submission states; clear drafts only after success.
- Real request mapping converts poll duration in minutes into an ISO `endsAt`.
  Omit unchanged polls on edits. Preserve omission versus explicit removal through
  `removePoll`, `removeLocation` and `removeLinkPreview`; reject update/remove
  conflicts rather than sending both operations.
- Preserve open-ended polls and voting guards for closed, expired or already-voted
  polls. Posts and comments use their respective vote endpoints.
- Scheduled posts do not support polls or locations. Use the shared date bounds
  and payload builders, including timezone conversion, rather than custom limits.

Use the existing media validation, image compression, preview creation and upload
pipeline. Respect configured file sizes/types and enabled features. Revoke owned
object URLs on removal, replacement, failed preparation or unmount as appropriate.
Keep image caching and mock IndexedDB stores separate from serialized API bodies.
Cancel supported searches/previews and ignore stale async results after selection
changes or unmount; transport cancellation is not available in every adapter.

`AppEffects` coordinates scheduled checks and focus/storage listeners. Mock
scheduled media persists through its IndexedDB store. Strip `mockMedia` from real
requests. The real adapter's `publishDue()` currently returns `[]`; do not add
client-side real-server publication or claim parity without a backend contract.

## UI, routing and accessibility

Reuse existing `src/shared/ui` primitives, `cn`, Button variants, Spinner, Avatar and
shared icons. Use semantic Tailwind classes such as `bg-background`,
`text-foreground` and `border-border` so light and dark themes remain consistent.
Tailwind 4 is integrated through Vite and `src/app/styles/index.css`; do not assume a separate
Tailwind configuration file exists.

- Themes are `dark`, `light` and `system`, applied through `data-theme`. For a new
  theme, update theme types/labels, CSS variables and relevant selection behavior.
- Reuse named z-index utilities for navigation, media viewers, modals and popovers.
- Keep desktop sidebars and mobile navigation usable at existing breakpoints.
- Add routes through `APP_ROUTES` and the current router/guard structure. Follow
  existing lazy-page loading instead of eagerly importing all route screens.
- Preserve labels, keyboard operation, visible focus, loading and disabled states.
  Reuse Floating UI focus/dismissal behavior and the shared body scroll lock for
  overlays, including nested dialogs and unsaved-change confirmation flows.
- Keep the existing emoji/Twemoji rendering path and media-viewer interactions.

## Testing and completion

Place tests in the owning module's `__tests__` directory, named `*.test.ts` or
`*.test.tsx`. Create directories only when adding tests. Do not split the current
suite into global unit/integration trees or introduce E2E infrastructure incidentally.

Vitest defaults to `node`; DOM tests opt into `// @vitest-environment happy-dom`.
Follow nearby React tests using `createRoot` and `act`; there is no Testing Library
dependency. Restore mocked globals, timers, listeners and mounted roots. Use `@/`
paths for mocked local modules as well as imports.

Choose checks according to the changed behavior:

- For a logic fix, add a meaningful regression case and run the affected tests.
- For code changes, run lint/build as appropriate; broaden to the full test suite
  for shared API, session, cache, mapper or composer changes.
- Cover success and relevant failures: request mapping/removal, cursor handling,
  optimistic rollback, stale-session responses, media cleanup or access control.
- For UI behavior changes, check affected mobile/desktop layouts, themes and
  keyboard interactions where browser verification is available.
- For documentation-only changes, verify facts, commands, links and diff scope;
  application builds/tests are not required solely for prose changes.

Review the final diff for accidental changes, generated assets and secrets. Report
what changed, which checks ran and any unresolved limitations. State when a check
was not run or an existing failure remains; do not present inspection as execution
or mock success as proof of real-server compatibility.
