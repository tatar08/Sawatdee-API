# Sawatdee API — User Manual & Operations Guide

> A lightweight, beautiful, **100% frontend-only** API client.
> Runs entirely in your browser. No backend. No cloud databases. Your data is yours.

---

## Table of Contents

1. [Introduction & Core Concept](#1-introduction--core-concept)
2. [CORS: The Sandbox Constraint](#2-cors-the-sandbox-constraint)
3. [Setup & Running Locally](#3-setup--running-locally)
4. [User Interface Overview](#4-user-interface-overview)
5. [Creating and Customizing Requests](#5-creating-and-customizing-requests)
6. [Response Viewer & Troubleshooting](#6-response-viewer--troubleshooting)
7. [Environments & Variables](#7-environments--variables)
8. [Import & Export (Migration)](#8-import--export-migration)
9. [Advanced: Collection Runner with CSV/JSON Data](#9-advanced-collection-runner-with-csvjson-data)
10. [Aesthetics, Themes, & Mascots](#10-aesthetics-themes--mascots)
11. [Security & Enterprise Features](#11-security--enterprise-features)

---

## 1. Introduction & Core Concept

Sawatdee API is a premium API client designed as a browser-first, privacy-respecting homage to Postman. Unlike other tools that route requests through proxy servers or store your workspace in the cloud, **Sawatdee API runs completely in your browser**.

### Key Characteristics:

- **Zero Backend**: Fires requests directly from your browser's context via `fetch()`.
- **Private and Offline-First**: Workspace collections, environments, history, and settings are saved locally in the browser using **IndexedDB** (via Dexie). Your API keys, tokens, and payloads are never sent to third-party servers.
- **Apple-Style Aesthetics**: Built with a "liquid-glass" glassmorphism theme, soft pastel accents, and customizable mascot themes.

---

## 2. CORS: The Sandbox Constraint

Because Sawatdee API runs strictly inside the browser sandbox, **it is subject to browser Cross-Origin Resource Sharing (CORS) security policies**. This is a browser security constraint, not a bug in Sawatdee API.

### CORS Cheat Sheet:

- **CORS-enabled APIs**: Work perfectly out of the box. The target server sends `Access-Control-Allow-Origin: *` or your page origin, permitting the browser to read the response.
- **Non-CORS APIs (Blocked)**: If the server doesn't send CORS headers, the browser blocks the response. In this case, Sawatdee API displays a dedicated **CORS Explainer** to diagnose the problem.
- **Mixed Content Warn**: The browser blocks HTTP calls from an HTTPS site. Sawatdee API detects this and warns you inline.
- **Forbidden Headers**: The browser blocks programmatic control over certain headers (e.g. `Host`, `Origin`, `User-Agent`, `Cookie`, `Content-Length`) for safety. Sawatdee API will warn you inline if you attempt to override them.

---

## 3. Setup & Running Locally

To run Sawatdee API in your development environment or host it on your local server:

### Prerequisites:

- **Node.js** (v18 or higher recommended)
- **npm** or **pnpm**

### Installation:

1. Clone or copy the project files to your system.
2. Open your terminal in the workspace directory.
3. Install dependencies:
   ```bash
   pnpm install  # or npm install
   ```

### Development Server:

To run the local Vite development server with Hot Module Replacement (HMR):

```bash
pnpm dev      # or npm run dev
```

Open `http://localhost:5173/` in your browser.

### Production Build:

To compile and bundle the application into optimized static assets (`dist` folder):

```bash
pnpm build    # or npm run build
```

The resulting static assets in `dist/` can be served by any static hosting service (e.g., Azure SWA, GitHub Pages, Netlify).

---

## 4. User Interface Overview

Sawatdee API uses a classic **three-pane IDE layout** that adapts to all screen sizes:

```
+------------------------------------------------------------------------------------------------+
|  Sawatdee API  [Logo Tagline]                             [Active Environment ▾]   [🌓] [⚙ Settings] |
+------------------+-----------------------------------------------------------------------------+
|  COLLECTIONS     |  GET ▾  | https://api.example.com/v1/users/{{userId}}                 | [Save] [Send ▶] |
|  [+ New Col]     +-----------------------------------------------------------------------------+
|  + Users API     |  Params | Headers (1) | Body | Auth                                         |
|    - Get User    |  +-----------------------------------------------------------------------+  |
|    - Edit User   |  | Enabled | Key         | Value                           | Action  |  |
|    - Delete User |  | [x]     | userId      | 420                             | [Trash] |  |
|                  |  | [ ]     | [New key..] | [New value..]                   |         |  |
|  HISTORY         |  +-----------------------------------------------------------------------+  |
|  - GET /users    +-----------------------------------------------------------------------------+
|  - POST /auth    |  Status: 200 OK  •  Time: 120 ms  •  Size: 420 Bytes          [Copy] [Download] |
|                  +-----------------------------------------------------------------------------+
|                  |  Body (Pretty) | Headers | Cookies                                          |
|                  |  +-----------------------------------------------------------------------+  |
|                  |  | {                                                                     |  |
|                  |  |   "id": 420,                                                          |  |
|                  |  |   "username": "shiba_inu"                                             |  |
|                  |  | }                                                                     |  |
|                  |  +-----------------------------------------------------------------------+  |
+------------------+-----------------------------------------------------------------------------+
```

### Layout Elements:

1. **Top Bar**: Displays the system tagline, environment selector, dark mode toggle, and the settings modal button.
2. **Sidebar**: Houses saved collection trees, history lists, and the "New Collection" creation action.
3. **Workspace Pane**:
   - **Request Bar**: Contains the HTTP Method dropdown, URL text input (supporting `{{variables}}`), and the [Send] / [Save] actions.
   - **Request Tabs**: Edit request params, headers, request body payloads, and auth configurations.
   - **Response Panel**: Shows response metadata (Status code, Duration in ms, Size in Bytes) and tabbed response contents (Body, Headers, Cookies).

---

## 5. Creating and Customizing Requests

### 5.1 HTTP Methods

Supports standard REST verbs: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.

### 5.2 Variable Interpolation

Type variables anywhere inside request URLs, header values, or parameters using double curly braces: `{{userId}}`. They resolve dynamically from the active environment or collection-level variables. Unresolved variables are highlighted in an alert banner below the URL bar.

### 5.3 Authorization Modes

Configure auth at the request level. Sawatdee API handles header injection automatically:

- **None**: No authentication headers sent.
- **Bearer Token**: Input a token. Resolves to `Authorization: Bearer <token>`.
- **Basic Auth**: Enter username and password. Resolves to `Authorization: Basic <base64(user:pass)>`.
- **API Key**: Enter a custom Key Name, Value, and injection site ("Header" or "Query param").

> [!NOTE]  
> Under the Auth tab, Sawatdee API displays a read-only **Live Preview** of the headers/query keys that will be injected on send. It also alerts you if your manual headers override the auth credentials.

### 5.4 Request Payload (Body)

Configure the payload under the **Body** tab:

- **None**: No body payload sent (default for GET requests).
- **JSON**: Input raw JSON in the CodeMirror editor.
- **Raw**: Send raw text with custom language highlighting (`text`, `xml`, `html`).
- **Form data / URL encoded**: Edit key-value pairs in a tabular interface. Supports dynamic variable interpolation.

---

## 6. Response Viewer & Troubleshooting

Once a response is returned, the Response Panel offers rich tools to inspect it.

### 6.1 Body Sub-modes

- **Pretty**: Formatted JSON/XML syntax-highlighted response utilizing CodeMirror (read-only).
- **Raw**: Raw response text returned from the server.
- **Preview**:
  - **Images**: Renders images (`image/png`, `image/jpeg`, etc.) directly inside the browser using secure blob URLs.
  - **HTML**: Renders HTML responses inside a sandboxed `<iframe>` to prevent execution of malicious scripts.

### 6.2 Search & Filters

Use the inline search bar to search for terms inside raw or formatted response bodies. It displays match counts and highlights matches using `<mark>` blocks.

### 6.3 CORS and Network Error Handling

If a request fails due to a browser CORS policy block, Sawatdee API doesn't throw a generic error. It opens the **CORS Explainer**:

```
+----------------------------------------------------------------------------------+
| ⚠️ Request blocked or unreachable                                                 |
| Sawatdee API runs entirely in your browser. This network failure usually means:     |
| 1. The target server did not allow Cross-Origin Resource Sharing (CORS)          |
| 2. The URL is invalid or the server is down.                                     |
|                                                                                  |
| Checklist:                                                                       |
|  ✓ Is the URL correct and the server up?                                         |
|  ✓ Does the API send Access-Control-Allow-Origin?                                |
|  ⚠️ HTTPS page cannot call HTTP APIs (mixed content blocked by browser)           |
|                                                                                  |
| Note: This is a browser security feature, not a Sawatdee API bug.                    |
+----------------------------------------------------------------------------------+
```

---

## 7. Environments & Variables

Create variable contexts to swap targets easily (e.g., Local vs Staging).

1. Click the **⚙ Settings** button in the Top Bar and navigate to the **Environments** manager (or click the active environment selector).
2. Create environments and define key-value variable variables:
   ```
   Name: Local Dev
   +------------------------------+
   | Key       | Value            |
   +-----------+------------------+
   | host      | localhost:3000   |
   | userId    | 420              |
   +------------------------------+
   ```
3. Close the modal and select **Local Dev** in the active environment selector in the Top Bar.
4. Use `{{host}}/users/{{userId}}` in your request URL. It will automatically resolve to `localhost:3000/users/420`.

---

## 8. Import & Export (Migration)

Sawatdee API offers complete interoperability to import assets from other tools or export your work.

### 8.1 Import Formats

Sawatdee API automatically detects the file format when importing:

- **Postman Collections v2.1** (imports collections, request templates, headers, query params).
- **Postman Environments** (imports variables and environment mappings).
- **Sawatdee API Native Bundles** (restores your entire database backup).

> [!IMPORTANT]  
> **Conflict Resolution**: Existing data is never overwritten during imports. If an imported item shares a name with an existing item, Sawatdee API appends an `(imported)` suffix to keep them distinct.

### 8.2 Export Formats

- **Postman Collection v2.1**: Export individual collections.
- **Sawatdee API Native**: Export individual collections, requests, or full workspace backups.

---

## 9. Advanced: Collection Runner Configuration

The Collection Runner lets you run through an entire collection of API requests sequentially. You can customize the run loop by defining key run parameters:

### 9.1 Run Configurations

- **Iterations**: Specify how many times to repeat the execution loop.
  - If a data file is uploaded, this defaults to the number of rows in the data file.
  - If you input a larger number of iterations, the runner will cycle through the data file rows sequentially.
  - If no data file is uploaded, this defaults to `1` and simply repeats the static requests in the collection.
- **Delay**: Define a delay duration in milliseconds (`ms`) between individual requests (e.g. `1000 ms` to wait 1 second). This is useful to prevent rate-limiting or server overloads.
- **Active Environment**: Select or change the active environment context directly inside the runner modal using the dropdown. Any variable replacements in the requests will respect the selected environment.
- **Request Checklist**: Toggle checkboxes next to each request in the setup panel to include or exclude them from the run. You can also use the **Select All** and **Deselect All** buttons to make bulk adjustments.

### 9.2 Running with Data Files (CSV / JSON)

1. Open the dropdown next to a collection in the Sidebar and select **Run Collection**.
2. Under **Data File**, upload a **CSV** file (with a header row) or a **JSON Array** containing objects representing iteration rows:
   ```csv
   id,username,role
   101,alice,admin
   102,bob,user
   103,charlie,moderator
   ```
3. Use the keys `{{id}}`, `{{username}}`, `{{role}}` inside your collection requests.
4. Set the **Delay**, adjust **Iterations**, or select the **Environment** and **Requests** to run.
5. Click **Run Collection**. Sawatdee API will loop through the requests for each row in the file.
6. The runner console provides real-time progress:

```
+--------------------------------------------------------------------------------------+
| Run Collection: Admin Suite                                                          |
| Status: Finished   •   Passed: 6   •   Failed: 0   •   Avg Time: 45 ms               |
+--------------------------------------------------------------------------------------+
| Iteration   | Request               | Status   | Time   | Action                     |
+-------------+-----------------------+----------+--------+----------------------------+
| [1]         | Get Profile (alice)   | 200 OK   | 40 ms  | [View Details]             |
| [1]         | Update Role (admin)   | 204 OK   | 48 ms  | [View Details]             |
| [2]         | Get Profile (bob)     | 200 OK   | 38 ms  | [View Details]             |
| [2]         | Update Role (user)    | 204 OK   | 52 ms  | [View Details]             |
+--------------------------------------------------------------------------------------+
```

You can view logs for each request, inspect intermediate variables, and stop the run at any point.

### 9.3 Exporting Results

Once the run is complete, click **Export Results** to download a comprehensive JSON report containing:
- Collection details and execution date.
- The environment used.
- Execution statistics (total requests, passed/failed counts, average duration).
- Detailed logs for each request (url, status, duration, response body preview, headers).

---

## 10. Aesthetics, Themes, & Mascots

Sawatdee API includes customizable visual skins with Japan-inspired animal mascot drawings:

| Theme Name        | Color Palette                         | Mascot Illustration            |
| ----------------- | ------------------------------------- | ------------------------------ |
| **Classic Pink**  | Elegant soft pink, frosted glass      | Classic logo layout            |
| **Shiba Inu**     | Warm autumn amber and gold            | Shiba Inu mascot               |
| **Maneki-Neko**   | Calming cream, gold, and red accents  | Lucky Beckoning Cat mascot     |
| **Moonlit Usagi** | Deep twilight lilac and lavender      | Rabbit viewing the moon mascot |
| **Matcha Panda**  | Soft mint green and forest dark tones | Panda eating matcha shoots     |
| **Thai Chang**    | Cool teal and royal indigo accents    | Traditional Thai Elephant      |

### Visual Settings:

- **Dark / Night Mode**: Supports all themes. Transitions glass layers into dark translucent overlays (`rgba(21, 14, 18, 0.45)`) to maintain contrast in low-light environments. Toggle using the 🌓 button on the Top Bar.
- **Reduce Transparency**: Swaps frosted-glass layers for solid surfaces. Ideal for high-contrast accessibility or low-performance devices.
- **Masot Opacity**: Mascot backdrops automatically decrease in opacity during dark mode to keep text highly readable.

---

## 11. Security & Enterprise Features

To support secure deployments of Sawatdee API within internal organizational networks, the system includes advanced client-side constraints and secure server-side proxy capabilities:

### 11.1 Client-Side Username & PIN Lock
To prevent unauthorized users from viewing sensitive collection requests, history entries, custom keys, or credentials stored inside IndexedDB in the same browser:
- **Setup Mode**: On the first launch, if no credentials have been configured, the user is required to set a Username (at least 3 characters), set a 6-8 digit PIN code, and confirm the PIN.
- **Lock Screen Overlay**: Upon refreshing or opening the app, a fullscreen lock screen blocks the workspace. Keyboard shortcuts and sidebar layouts are inaccessible. The user must enter both their correct Username and PIN to unlock.
- **Local Storage**: The Username is saved in settings as plain text (`username`), and the PIN code is hashed locally using SHA-256 via the Web Crypto API (`window.crypto.subtle.digest`) and stored as a hash value (`pinHash`) in IndexedDB. No credentials are ever sent or exposed to external servers.
- **Automatic Wipe (Auto-Wipe)**: To prevent brute-force attacks on physical devices, the application will automatically call `clearAllAppData()` to delete all IndexedDB data (including collections, requests, history, environments, and settings) after **5 incorrect attempts** of entering credentials, resetting the app to its clean Setup Mode.
- **Manual Reset**: If the details are forgotten, a manual "Forgot details?" option is available to wipe all database entries and reset the application to Setup Mode.

### 11.2 Secure CORS Proxy (`api/proxy.ts`)
The serverless CORS proxy endpoint contains strict checks to enforce enterprise network policies:
- **SSRF Prevention**: The proxy actively checks the target hostnames. Requests to loopback/localhost (`localhost`, `127.0.0.1`, `::1`), private ranges (`10.x.x.x`, `192.168.x.x`, `172.16.x.x` - `172.31.x.x`), and cloud instance metadata services (`169.254.169.254`) are blocked with HTTP 403 Forbidden.
- **Domain Whitelisting (`ALLOWED_DOMAINS`)**: If configured via environment variables, the proxy will reject requests targeting domains not present on the whitelist.
- **Shared Secret Verification (`PROXY_SECRET`)**: If configured, the proxy verifies that the incoming request includes a matching token in the `x-proxy-secret` header, returning HTTP 401 Unauthorized otherwise.
- **JWT Verification (`PROXY_JWT_SECRET`)**: Supports central Identity Providers (IdPs) by verifying signatures (HMAC SHA-256) of JWT Bearer tokens passed within the standard `Authorization` header.

---

_Sawatdee API — Built for developer privacy and clean API workflows._
