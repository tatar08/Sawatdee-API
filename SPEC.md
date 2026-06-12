# Sawatdee API — Product & Engineering Specification

> A lightweight, beautiful, **frontend-only** API client. A parody/homage to Postman.
> Runs entirely in the browser. No backend. Hosted on Azure Static Web Apps.

---

## 1. Vision

Sawatdee API is a single-page web application that lets a user build, send, and organize HTTP requests — the core loop of Postman — without any server component. Everything (collections, environments, history, settings) lives in the user's browser. Every API call is fired **directly from the user's browser** via `fetch()`; our hosting never proxies or sees the traffic.

Design north star: **lightweight, fast, and beautiful** — a white-and-pink palette with Apple-style "liquid glass" (glassmorphism) surfaces.

### Non-goals (v1)

- No user accounts, no cloud sync, no sharing links.
- No backend, no serverless functions (may revisit a CORS proxy later — see §9).
- No team/collaboration features.
- No mock servers, no automated test runners (basic scripting deferred to v2).

---

## 2. Constraints & Hard Truths

### 2.1 CORS is the defining constraint

The app runs in a browser sandbox. Unlike Postman desktop (Electron, native HTTP), Sawatdee API **cannot bypass CORS**. Requests to APIs that don't return permissive `Access-Control-Allow-Origin` headers will fail.

**Engineering implications:**

- Distinguish a _CORS/network failure_ from a _real HTTP error response_ in the UI. A failed `fetch()` that throws `TypeError` is almost always CORS or network — show a dedicated, friendly explainer, not a generic "request failed".
- Provide an info panel / first-run note: "Sawatdee API runs in your browser. Some APIs block cross-origin browser requests (CORS). This is a browser security feature, not a bug."
- Forbidden headers (`Host`, `Origin`, `User-Agent`, `Cookie`, `Content-Length`, etc.) cannot be set programmatically — the browser strips them. Detect attempts to set these and warn inline.

### 2.2 Other browser limits

- No raw TCP, no non-HTTP protocols. HTTP(S) only in v1 (WebSocket optional later).
- Response to opaque/`no-cors` requests is unreadable — never silently fall back to `no-cors` mode (it returns an unusable opaque response).
- Large response bodies must be handled without freezing the UI (stream / size-guard, see §7.4).

---

## 3. Tech Stack

| Concern                     | Choice                                                           | Rationale                                                                 |
| --------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Build tool                  | **Vite**                                                         | Fast dev, tiny config, first-class SWA fit                                |
| Framework                   | **React 18 + TypeScript**                                        | Component model, type safety, hiring pool                                 |
| Routing                     | **React Router** (hash or browser)                               | SWA supports SPA fallback                                                 |
| State                       | **Zustand**                                                      | Minimal, no boilerplate, fits "lightweight"                               |
| Storage                     | **IndexedDB via Dexie**                                          | Structured, large quota, async; localStorage too small for history/bodies |
| Styling                     | **CSS Modules + CSS custom properties** (or Tailwind — see note) | Design tokens drive the glass theme                                       |
| Icons                       | **Lucide** (`lucide-react`)                                      | Clean, light, consistent stroke icons                                     |
| Code editor                 | **CodeMirror 6**                                                 | Lightweight, themeable, JSON/body editing + syntax highlight              |
| Syntax highlight (response) | CodeMirror read-only or **Shiki**                                | Pretty response rendering                                                 |
| ID generation               | `crypto.randomUUID()`                                            | Native, no dep                                                            |
| Schema validation (import)  | **Zod**                                                          | Validate imported collections / persisted data                            |

> **Styling note:** Default to **CSS custom properties + CSS Modules** so the liquid-glass tokens (§5) are first-class and the bundle stays tiny. Tailwind is acceptable if the engineer prefers, but the design tokens in §5 must be preserved as CSS variables regardless.

**Bundle budget:** target < 250 KB gzipped for initial load. Lazy-load CodeMirror and any heavy panels.

---

## 4. Information Architecture & Layout

Three-pane desktop layout, collapsible to responsive single-column on narrow viewports.

```
┌───────────────────────────────────────────────────────────────────────┐
│  TopBar:  [Sawatdee API logo]   [Environment selector ▾]   [⚙ settings]    │
├──────────────┬────────────────────────────────────────────────────────┤
│              │  RequestBar: [METHOD ▾] [URL.................] [Send ▶]  │
│  Sidebar     ├────────────────────────────────────────────────────────┤
│              │  RequestTabs: Params | Headers | Body | Auth            │
│  - Collections│  ┌──────────────────────────────────────────────────┐  │
│    └ requests │  │  (editor area for the active tab)                │  │
│  - History    │  └──────────────────────────────────────────────────┘  │
│              ├────────────────────────────────────────────────────────┤
│  [+ New]     │  ResponsePanel:                                         │
│              │  Status 200 · 142 ms · 1.2 KB   [Body|Headers|Cookies] │
│              │  ┌──────────────────────────────────────────────────┐  │
│              │  │  (pretty / raw / preview response viewer)        │  │
│              │  └──────────────────────────────────────────────────┘  │
└──────────────┴────────────────────────────────────────────────────────┘
```

Open requests are managed as **tabs** (multiple requests open at once). Unsaved tabs show a dot indicator.

---

## 5. Design System — "Liquid Glass, White & Pink"

### 5.1 Aesthetic

- Soft white background with a faint pink gradient wash.
- Floating **frosted-glass panels**: translucent, blurred backdrop, hairline border, soft shadow, generous corner radius.
- Pink as the accent/action color (Send button, active states, focus rings).
- Lots of whitespace, light type, subtle motion. Calm, premium, Apple-like.

### 5.2 Design tokens (CSS custom properties)

```css
:root {
  /* Palette — white / pink */
  --pg-bg-base: #fdf7fa; /* near-white, faint pink */
  --pg-bg-gradient: linear-gradient(
    135deg,
    #fff5f9 0%,
    #fde8f1 50%,
    #f8eefc 100%
  );
  --pg-pink-50: #fff0f6;
  --pg-pink-100: #ffd6e7;
  --pg-pink-300: #ff9ec4;
  --pg-pink-500: #ff5fa2; /* primary accent */
  --pg-pink-600: #f43f8e; /* accent hover/active */
  --pg-pink-700: #d62e76;

  --pg-text-strong: #2b1b25;
  --pg-text: #5a4a54;
  --pg-text-muted: #9b8a94;

  /* Glass surfaces */
  --pg-glass-bg: rgba(255, 255, 255, 0.55);
  --pg-glass-bg-strong: rgba(255, 255, 255, 0.72);
  --pg-glass-border: rgba(255, 255, 255, 0.65);
  --pg-glass-blur: 18px;
  --pg-glass-shadow:
    0 8px 32px rgba(214, 46, 118, 0.12), 0 2px 8px rgba(43, 27, 37, 0.06);

  /* Status colors */
  --pg-ok: #2bbf8a; /* 2xx */
  --pg-info: #4aa6e0; /* 3xx */
  --pg-warn: #e8a13a; /* 4xx */
  --pg-err: #e0537a; /* 5xx / network */

  /* Method colors */
  --pg-method-get: #2bbf8a;
  --pg-method-post: #e8a13a;
  --pg-method-put: #4aa6e0;
  --pg-method-patch: #9b6ee0;
  --pg-method-delete: #e0537a;

  /* Radius / spacing / motion */
  --pg-radius-sm: 10px;
  --pg-radius: 16px;
  --pg-radius-lg: 24px;
  --pg-space: 8px; /* 8pt grid: use multiples */
  --pg-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --pg-dur: 180ms;

  /* Type */
  --pg-font-ui:
    -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui,
    sans-serif;
  --pg-font-mono:
    "SF Mono", "JetBrains Mono", "Fira Code", ui-monospace, monospace;
}
```

### 5.3 The glass surface (reusable)

```css
.glass {
  background: var(--pg-glass-bg);
  backdrop-filter: blur(var(--pg-glass-blur)) saturate(160%);
  -webkit-backdrop-filter: blur(var(--pg-glass-blur)) saturate(160%);
  border: 1px solid var(--pg-glass-border);
  border-radius: var(--pg-radius);
  box-shadow: var(--pg-glass-shadow);
}
```

### 5.4 Design rules

- **Corner radius:** panels `--pg-radius-lg`, controls `--pg-radius`, chips `--pg-radius-sm`.
- **Focus ring:** 2px `--pg-pink-300` glow, never default browser outline (but keep `:focus-visible` accessible).
- **Motion:** all hover/active transitions use `--pg-dur` + `--pg-ease`. Panels fade+rise on mount (8px translateY). Respect `prefers-reduced-motion`.
- **Send button:** filled pink gradient, subtle inner highlight, gentle scale on press.
- **Method badges:** colored pill per HTTP method (token map above).
- **Accessibility:** glass must keep text contrast ≥ 4.5:1 — use `--pg-glass-bg-strong` behind body text where blur reduces legibility. Provide a "reduce transparency" toggle in settings that swaps glass for solid surfaces.
- **Dark mode:** out of scope for v1 visually, but author tokens so a `[data-theme="dark"]` override is a later drop-in.

---

## 6. Data Model

All persisted in IndexedDB (Dexie). TypeScript shapes:

```ts
type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

type BodyMode = "none" | "json" | "raw" | "form-data" | "x-www-form-urlencoded";

interface RequestBody {
  mode: BodyMode;
  raw?: string; // json / raw text
  rawLang?: "json" | "text" | "xml" | "html";
  formData?: KeyValue[]; // form-data / urlencoded
}

type AuthType = "none" | "bearer" | "basic" | "api-key";

interface Auth {
  type: AuthType;
  bearerToken?: string;
  basicUser?: string;
  basicPass?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyIn?: "header" | "query";
}

interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string; // may contain {{variables}}
  params: KeyValue[]; // query params
  headers: KeyValue[];
  body: RequestBody;
  auth: Auth;
  collectionId?: string;
  createdAt: number;
  updatedAt: number;
  // Lossless round-trip stash for Postman fields we don't model/execute (§7.5):
  postmanEvents?: unknown; // prerequest/test scripts — preserved, not run
  postmanAuthRaw?: unknown; // unsupported auth blocks (oauth2, awsv4, …)
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  requestIds: string[]; // ordered
  createdAt: number;
  updatedAt: number;
}

interface Environment {
  id: string;
  name: string;
  variables: KeyValue[]; // {{var}} resolution source
}

interface HistoryEntry {
  id: string;
  request: ApiRequest; // snapshot at send time
  response: {
    status: number;
    statusText: string;
    durationMs: number;
    sizeBytes: number;
    headers: Record<string, string>;
    bodyPreview: string; // truncated; full body not persisted if large
  } | null;
  error?: string;
  sentAt: number;
}

interface Settings {
  activeEnvironmentId: string | null;
  reduceTransparency: boolean;
  requestTimeoutMs: number; // default 30000
  maxResponsePreviewBytes: number; // default 2_000_000
}
```

### Dexie schema

```ts
db.version(1).stores({
  collections: "id, name, updatedAt",
  requests: "id, collectionId, updatedAt",
  environments: "id, name",
  history: "id, sentAt",
  settings: "id", // single row, id = "app"
});
```

---

## 7. Core Behaviors

### 7.1 Variable resolution

- `{{var}}` syntax. Resolution order: **environment variables** → (later: collection vars). Unresolved variables highlight in the URL/headers and warn before send.
- Resolve in: URL, query params, headers, body, auth fields.
- Implement as a pure function `resolve(template: string, vars: Record<string,string>) => string` with `{{...}}` regex. Show a live preview of the resolved URL under the URL bar.

### 7.2 Sending a request

Pipeline:

1. Resolve variables across all fields.
2. Build final URL: merge enabled query params into the URL's search string.
3. Build headers from enabled header rows + auth injection (Bearer/Basic/API-key).
4. Build body per `BodyMode` (JSON → string + `Content-Type: application/json` if absent; form-data → `FormData`; urlencoded → `URLSearchParams`).
5. `fetch()` with `AbortController` timeout (`requestTimeoutMs`).
6. Measure timing via `performance.now()` before/after.
7. Read response: capture status, statusText, headers (iterate `Headers`), body (text; pretty-print if JSON).
8. Compute size from `Content-Length` or measured byte length.
9. Push a `HistoryEntry`.

**Error handling:** a thrown `fetch` (TypeError) → show CORS/network explainer card with the target origin and a checklist. A completed response with 4xx/5xx is a **success at the transport level** — render it normally with the status color.

### 7.3 Auth injection

- **Bearer:** `Authorization: Bearer <token>`.
- **Basic:** `Authorization: Basic <base64(user:pass)>` via `btoa`.
- **API key (header):** custom header name/value. **(query):** appended as query param.
- Auth-injected headers should be visibly indicated (read-only preview) but not duplicate user-set headers.

### 7.4 Response viewer

- Tabs: **Body**, **Headers**, **Cookies** (cookies read-only / often empty due to browser restrictions — note this).
- Body sub-modes: **Pretty** (JSON/XML formatted + syntax highlight), **Raw**, **Preview** (render HTML in sandboxed `<iframe sandbox>`, or image if content-type is image).
- Guard large bodies: if `> maxResponsePreviewBytes`, show "Response too large to preview (N MB) — [Download]" instead of rendering. Offer download via Blob URL.
- Copy button, download-response button, search-in-body.

### 7.5 Import / Export — Postman-compatible (first-class)

Sawatdee API must **fully read and write Postman's own JSON formats** so users can move between Sawatdee API and Postman without conversion. This is a v1 requirement, not a stretch goal.

**Two formats, both directions:**

| Format                      | Spec                                                           | Import | Export |
| --------------------------- | -------------------------------------------------------------- | ------ | ------ |
| Postman **Collection v2.1** | `schema.getpostman.com/json/collection/v2.1.0/collection.json` | ✅     | ✅     |
| Postman **Environment**     | Postman environment export shape                               | ✅     | ✅     |
| Sawatdee API native bundle  | our `Sawatdee APIVersion: 1` (collections + envs + settings)   | ✅     | ✅     |

**Import UX:** single file picker accepts any of the three. Detect format by shape (presence of `info._postman_id` / `info.schema` → collection v2.1; `_postman_variable_scope: "environment"` or `{ name, values[] }` → environment; `Sawatdee APIVersion` → native). Validate with Zod per format. Show a pre-import summary ("3 collections, 41 requests, 2 environments — Import?"). Merge, don't clobber (offer rename-on-conflict).

**Export UX:** export a collection → choose **Postman v2.1** (default, portable) or **Sawatdee API native**. Export an environment → Postman environment JSON. "Export all" → native bundle.

#### Postman Collection v2.1 ⇄ Sawatdee API mapping

```
Postman item.request                      Sawatdee API ApiRequest
─────────────────────────────────────────────────────────────────────
item.name                            →    name
request.method                       →    method
request.url.raw                      →    url            (prefer .raw; else rebuild from host/path/query)
request.url.query[]                  →    params[]       {key,value,disabled→!enabled,description}
request.header[]                     →    headers[]      {key,value,disabled→!enabled,description}
request.body.mode                    →    body.mode      (raw|formdata|urlencoded|none → our modes)
  body.raw + body.options.raw.language→    body.raw, body.rawLang   (json|text|xml|html)
  body.formdata[]                    →    body.formData[] (type=file dropped in v1 — browser limit; warn)
  body.urlencoded[]                  →    body.formData[] (mode=x-www-form-urlencoded)
request.auth                         →    auth           (bearer|basic|apikey → our AuthType; others → none + warn)
```

- **Folders:** Postman collections nest folders (`item` arrays within items). v1 flattens nested folders into the parent collection, prefixing request names with the folder path (e.g. `Users / Get user`). _(Preserve original folder structure as a stretch goal once the collection tree supports nesting.)_
- **Variables:** collection-level `variable[]` imported as collection variables (stored, resolved after environment vars — see §7.1). `{{var}}` syntax is already identical between the tools, so URLs/headers/bodies carry over verbatim.
- **`pm.*` scripts** (`event[]` — prerequest/test): **not executed** in v1 (no scripting sandbox). Preserve them verbatim on the request record (`postmanEvents?: unknown`) so a round-trip export doesn't lose them, and surface a non-blocking "scripts not run" badge. Do not attempt to interpret.
- **Unsupported auth types** (oauth2, awsv4, digest, etc.): import as `auth.type = "none"`, keep the raw block in `postmanAuthRaw?: unknown` for lossless re-export, and warn inline.

#### Postman Environment ⇄ Sawatdee API mapping

```
Postman env.name              →   Environment.name
env.values[] {key,value,enabled,type}  →  variables[] {key,value,enabled}
  (type "secret" honored as a value; we don't mask in v1 — note it)
```

On export, emit `{ name, values, _postman_variable_scope: "environment", _exporter_id: "Sawatdee API" }`.

#### Round-trip & lossless rules

- Import → export → import must not lose data Sawatdee API understands. Fields we don't model (scripts, exotic auth, folder metadata) are **stashed verbatim** on the record (`postman*Raw` fields) and re-emitted on export. Document this contract in `lib/importExport.ts`.
- Every importer validates with **Zod** and produces a structured report `{ imported, skipped, warnings[] }` shown to the user — never fail silently, never hard-crash on an unexpected field.

**Native bundle** (`Sawatdee APIVersion: 1`): full fidelity dump of collections + environments + settings for backup/restore. Always lossless.

### 7.6 Persistence rules

- Autosave request edits to IndexedDB debounced (~400 ms).
- History capped (e.g. last 100 entries; trim oldest). Large response bodies stored truncated to `maxResponsePreviewBytes`.
- All writes async; never block render.

---

## 8. Component Breakdown

```
src/
  main.tsx
  App.tsx
  theme/
    tokens.css            # §5.2 custom properties
    glass.css             # §5.3 reusable glass + base resets
  lib/
    db.ts                 # Dexie setup + schema
    send.ts               # request pipeline (§7.2) — framework-agnostic, unit-testable
    variables.ts          # resolve() + unresolved detection
    auth.ts               # auth header builders
    importExport.ts       # JSON + Postman import, Zod schemas
    format.ts             # pretty-print, size/time formatting
  store/
    useStore.ts           # Zustand: tabs, active request, env, collections
  components/
    TopBar.tsx
    EnvironmentSelector.tsx
    Sidebar/
      Sidebar.tsx
      CollectionTree.tsx
      HistoryList.tsx
    Request/
      RequestBar.tsx       # method + url + send
      MethodSelect.tsx
      RequestTabs.tsx
      ParamsEditor.tsx     # KeyValue table
      HeadersEditor.tsx    # KeyValue table (reuse)
      BodyEditor.tsx       # CodeMirror + mode switch
      AuthEditor.tsx
      KeyValueTable.tsx    # shared editable table
    Response/
      ResponsePanel.tsx
      StatusBar.tsx        # status pill, time, size
      BodyViewer.tsx       # pretty/raw/preview
      HeadersViewer.tsx
    common/
      GlassPanel.tsx
      Button.tsx
      MethodBadge.tsx
      Modal.tsx
      Toast.tsx
      EmptyState.tsx
      CorsExplainer.tsx    # the CORS failure card (§2.1)
```

**Testability:** `lib/` is pure TS with no React — unit test `send.ts`, `variables.ts`, `auth.ts`, `importExport.ts` with Vitest.

---

## 9. Secure CORS Proxy & Client PIN Lock

To allow Sawatdee API to be used securely within organizational environments, we have implemented an opt-in CORS Proxy along with a client-side PIN Lock screen.

### 9.1 Secure CORS Proxy (`api/proxy.ts`)

A server-side proxy endpoint is deployed at `/api/proxy` (supported in development via Vite dev server middleware in `vite.config.ts`). It includes the following security checks:

1. **SSRF Protection**: Automatically parses and verifies target hostnames. Requests to loopback (`localhost`, `127.0.0.1`, `::1`), private networks (`10.x.x.x`, `192.168.x.x`, `172.16.x.x` - `172.31.x.x`), or cloud metadata endpoints (`169.254.169.254`) are blocked (returns HTTP 403).
2. **Access Whitelist**: If the `ALLOWED_DOMAINS` environment variable is defined, requests to target URLs whose hostnames do not match or end with the allowed domains list are blocked (returns HTTP 403).
3. **Shared Secret Authentication**: If the `PROXY_SECRET` environment variable is defined, requests must contain a matching header value in `x-proxy-secret`, otherwise they are blocked (returns HTTP 401).
4. **JWT Verification**: If the `PROXY_JWT_SECRET` environment variable is defined, requests must contain a valid HMAC SHA-256 signed JWT Bearer token in the `Authorization` header, otherwise they are blocked (returns HTTP 401).

### 9.2 Client-side PIN & Username Lock Screen

To protect local user data (IndexedDB containing collection request histories, credentials, environment variables) on shared devices, a credentials lock is implemented:

1. **Setup Mode**: On first-run (when no credentials exist in settings), the user is prompted to set a Username (at least 3 characters), configure a 6-8 digit PIN code, and confirm the PIN code.
2. **Local Storage**: The Username is saved in settings as plain text (`username`), and the PIN is hashed using SHA-256 (`window.crypto.subtle.digest`) and saved inside settings as `pinHash` in IndexedDB.
3. **Lock Screen Overlay**: Upon page load or refresh, if a PIN hash is set, the UI renders only the fullscreen `PinLockScreen` overlay. The user must enter both their Username and PIN. No workspace components are loaded, and keyboard shortcuts are disabled.
4. **Auto-Wipe**: Entering incorrect credentials (incorrect Username or incorrect PIN) increments the counter. After 5 incorrect attempts, the app automatically runs `clearAllAppData()` to wipe all IndexedDB databases (collections, requests, history, environments, and settings) and resets the application to setup mode.
5. **Reset & Forgot Details**: A manual "Forgot details?" button triggers a prompt confirming the wipe of all workspace data and resets the state.

---

## 10. Azure Static Web Apps Deployment

- Build: `vite build` → `dist/`.
- `staticwebapp.config.json` with SPA fallback:

```json
{
  "navigationFallback": { "rewrite": "/index.html" },
  "globalHeaders": {
    "Cache-Control": "no-cache"
  }
}
```

- CI: GitHub Actions workflow (SWA default) — build on push, deploy to SWA. App location `/`, output `dist`, no API location (v1).
- Free tier sufficient. Custom domain optional.

---

## 11. Build Phases (for the engineer agent)

**Phase 0 — Scaffold**

- Vite + React + TS project. Install deps. Set up `tokens.css` / `glass.css`. Lint/format. Vitest.
- Deliverable: blank app shell renders the 3-pane glass layout (no logic).

**Phase 1 — Design system & shell**

- `GlassPanel`, `Button`, `MethodBadge`, `Modal`, `Toast`, `EmptyState`.
- TopBar, Sidebar, RequestBar, ResponsePanel skeletons wired to Zustand. Verify the look (white-pink liquid glass) against §5.

**Phase 2 — Send a request (the core loop)**

- `lib/send.ts`, `variables.ts`, `auth.ts`. Method+URL+Send → real `fetch`. Render status/time/size + raw body. CORS explainer on throw. Unit tests.

**Phase 3 — Request editors**

- Params, Headers, Body (CodeMirror), Auth tabs. KeyValueTable. Live resolved-URL preview.

**Phase 4 — Persistence: collections, history, environments**

- Dexie wiring. Save/open requests, collection tree, history list, environment CRUD + selector. Autosave debounce.

**Phase 5 — Response viewer polish**

- Pretty/Raw/Preview, syntax highlight, large-body guard, copy/download/search.

**Phase 6 — Import/Export + settings**

- Full **Postman v2.1 collection** + **Postman environment** import AND export, plus Sawatdee API native bundle (§7.5). Zod validation per format, shape-based format detection, pre-import summary, merge-with-rename, structured `{imported, skipped, warnings}` report, lossless round-trip stash.
- Settings panel (timeout, reduce-transparency, clear data).
- Unit tests with real Postman export fixtures (collection + environment) covering round-trip.

**Phase 7 — Polish & ship**

- Responsive/mobile column, keyboard shortcuts (⌘↵ send, ⌘S save), `prefers-reduced-motion`, accessibility pass, bundle-size check, `staticwebapp.config.json`, GitHub Actions deploy.

---

## 12. Acceptance Criteria (v1 done)

- [ ] Send GET/POST/PUT/PATCH/DELETE to a CORS-enabled API and see formatted response, status, time, size.
- [ ] CORS/network failure shows the dedicated explainer, distinct from a 4xx/5xx response.
- [ ] Create collections; save, reorder, and reopen requests; data survives reload.
- [ ] Define environments with `{{variables}}`; switching env changes resolution; live resolved-URL preview.
- [ ] Set query params, headers, JSON/form body, and Bearer/Basic/API-key auth.
- [ ] History records sends and is replayable.
- [ ] Export to Sawatdee API native JSON and re-import restores state losslessly.
- [ ] Import a real **Postman v2.1 collection** export → requests/params/headers/body/auth populate correctly; nested folders flatten with path-prefixed names; `{{vars}}` carry over; scripts preserved + flagged.
- [ ] Import a real **Postman environment** export → variables populate and resolve.
- [ ] Export a collection as Postman v2.1 and an environment as Postman env JSON → both re-import cleanly into actual Postman.
- [ ] Round-trip (import → export → import) loses no data, including unmodeled Postman fields.
- [ ] White-pink liquid-glass theme matches §5; "reduce transparency" toggle works; reduced-motion respected.
- [ ] Initial bundle < 250 KB gzipped; UI stays responsive on a 2 MB response.
- [ ] Deploys to Azure Static Web Apps with SPA routing working.

---

## 13. Keyboard Shortcuts

| Action          | Shortcut       |
| --------------- | -------------- |
| Send request    | ⌘/Ctrl + Enter |
| Save request    | ⌘/Ctrl + S     |
| New request/tab | ⌘/Ctrl + T     |
| Close tab       | ⌘/Ctrl + W     |
| Focus URL bar   | ⌘/Ctrl + L     |
| Toggle sidebar  | ⌘/Ctrl + B     |

---

## 14. Open Questions for Product

1. Postman folder nesting — flatten in v1 (current plan) acceptable, or is preserving nested folders required up front?
2. WebSocket support — wanted at all, or HTTP-only forever?
3. Branding: keep playful "Sawatdee API" mascot/logo, or clean wordmark only?
4. Should history persist response bodies, or only metadata (privacy/storage)?
