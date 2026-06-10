# Postgirl 💌

A lightweight, **frontend-only** API client — a parody/homage to Postman. Runs entirely in the browser: no backend, no accounts, no telemetry. All data lives in your browser's IndexedDB.

Full product/engineering spec: [SPEC.md](./SPEC.md).

## Features

### Request Builder
- HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- Query params, headers, and auth editors with enable/disable toggles
- Body modes: JSON, raw (text/XML/HTML), form-data, x-www-form-urlencoded
- Auth: Bearer token, Basic, API key (header or query)
- Live resolved-URL preview with `{{variable}}` substitution

### Collections & Tabs
- Multi-tab interface — open multiple requests side by side
- Save requests to named collections; drag-to-reorder within collections
- Autosave edits to saved requests (400 ms debounce)
- Draft tabs for unsaved one-off requests

### Environments
- Named environments with key-value variable stores
- `{{variable}}` resolution — environment vars first, then collection-level vars
- Quick-switch environment selector in the top bar

### History
- Last 100 sent requests stored automatically
- Replay any history entry by opening it into a new tab
- Clear history in one click

### Import / Export
- **Postman Collection v2.1** import and export (lossless round-trip)
- **Postman Environment** JSON import and export
- Native backup bundle (all collections + environments + settings)
- Conflict resolution: rename-on-conflict, never clobbers existing data

### Response Viewer
- Status, duration, and size displayed in a status bar
- Body viewer with syntax highlighting (JSON pretty-print)
- Response headers viewer
- Friendly CORS explainer — browser CORS failures are explained, not hidden

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/⌘ + Enter` | Send request |
| `Ctrl/⌘ + S` | Save request to collection |
| `Ctrl/⌘ + T` | New tab |
| `Ctrl/⌘ + W` | Close tab |
| `Ctrl/⌘ + L` | Focus URL bar |
| `Ctrl/⌘ + B` | Toggle sidebar |

### Settings
- Request timeout (default 30s)
- Max response preview size (default 2 MB)
- Reduce transparency toggle (accessibility)

## Architecture

```
src/
├── lib/               # Pure logic — no React
│   ├── types.ts       # Core data model (ApiRequest, Collection, Environment, …)
│   ├── send.ts        # fetch() wrapper — timeout, size cap, duration tracking
│   ├── variables.ts   # {{variable}} resolution engine
│   ├── auth.ts        # Auth header construction
│   ├── importExport.ts# Postman v2.1 + native bundle round-trip
│   ├── format.ts      # Response body formatting
│   ├── download.ts    # File download helper
│   └── db.ts          # Dexie (IndexedDB) schema + helpers
├── store/
│   └── useStore.ts    # Zustand store — all app state and async actions
├── hooks/
│   └── useKeyboardShortcuts.ts
├── components/
│   ├── Request/       # RequestBar, RequestTabs, editors (Params/Headers/Body/Auth)
│   ├── Response/      # ResponsePanel, BodyViewer, HeadersViewer, StatusBar
│   ├── Sidebar/       # CollectionTree, HistoryList
│   ├── common/        # GlassPanel, Modal, Toast, Button, CorsExplainer, …
│   ├── TopBar.tsx
│   ├── EnvironmentManager.tsx
│   ├── EnvironmentSelector.tsx
│   ├── ImportExportModal.tsx
│   └── SettingsModal.tsx
└── theme/
    ├── tokens.css     # Design tokens
    └── glass.css      # Liquid-glass visual layer
```

**Key dependencies:**

| Package | Role |
|---|---|
| React 18 | UI |
| Zustand 5 | Global state |
| Dexie 4 | IndexedDB ORM |
| CodeMirror 6 | JSON body / response editor |
| Vite 6 | Build tooling |
| Vitest | Unit tests |

## Develop

```bash
pnpm install
pnpm dev        # Vite dev server
pnpm test       # Vitest unit tests (lib/)
pnpm build      # type-check + production build → dist/
```
