# Postgirl 💌

A lightweight, beautiful, **frontend-only** API client — a parody/homage to Postman.
Runs entirely in the browser: no backend, no accounts, no telemetry. Collections,
environments, history and settings live in your browser (IndexedDB).

Full product/engineering spec: [SPEC.md](./SPEC.md).

## Highlights

- Build & send HTTP requests (GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS) straight from the browser via `fetch()`
- Collections, tabs, autosaved edits, replayable history
- Environments with `{{variable}}` resolution + live resolved-URL preview
- Bearer / Basic / API-key auth, JSON/raw/form bodies (CodeMirror editor)
- **Postman-compatible import/export** — Collection v2.1 and Environment JSON round-trip losslessly, plus a native backup bundle
- Friendly CORS explainer: a browser page cannot bypass CORS — failures are explained, not hidden
- White-and-pink "liquid glass" design, reduce-transparency toggle, reduced-motion support

## Develop

```bash
npm install
npm run dev        # Vite dev server
npm test           # Vitest unit tests (lib/)
npm run build      # type-check + production build (dist/)
```

## Deploy (Azure Static Web Apps)

`staticwebapp.config.json` provides the SPA fallback. The GitHub Actions workflow
(`.github/workflows/azure-static-web-apps.yml`) builds and deploys on push — set the
`AZURE_STATIC_WEB_APPS_API_TOKEN` repository secret from your SWA resource. App
location `/`, output `dist`, no API.
