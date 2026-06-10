import type { ApiRequest, Auth, KeyValue } from "./types";
import { resolve } from "./variables";
import { buildAuthInjection } from "./auth";

/**
 * Request pipeline (SPEC §7.2), framework-agnostic.
 * prepareRequest() is pure; sendRequest() takes a swappable fetch so a
 * future CORS-proxy transport (SPEC §9) can be added without rewiring the UI.
 */

export interface PreparedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: BodyInit;
  /** Auth-injected headers, for read-only preview in the UI (SPEC §7.3). */
  authHeaders: Record<string, string>;
}

export interface SendSuccess {
  ok: true;
  status: number;
  statusText: string;
  durationMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  contentType: string;
  /** Empty string when bodyTruncated (too large to preview). */
  bodyText: string;
  bodyTruncated: boolean;
  /** Full body, for download / binary preview. */
  bodyBlob: Blob;
}

export interface SendFailure {
  ok: false;
  kind: "cors-or-network" | "timeout";
  message: string;
  durationMs: number;
}

export type SendResult = SendSuccess | SendFailure;

// Forbidden header names the browser strips silently (SPEC §2.1) — warn in UI.
const FORBIDDEN_HEADERS = new Set([
  "accept-charset",
  "accept-encoding",
  "access-control-request-headers",
  "access-control-request-method",
  "connection",
  "content-length",
  "cookie",
  "cookie2",
  "date",
  "dnt",
  "expect",
  "host",
  "keep-alive",
  "origin",
  "referer",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "user-agent",
  "via",
]);

export function isForbiddenHeader(name: string): boolean {
  const n = name.trim().toLowerCase();
  return FORBIDDEN_HEADERS.has(n) || n.startsWith("proxy-") || n.startsWith("sec-");
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  const n = name.toLowerCase();
  return Object.keys(headers).some((k) => k.toLowerCase() === n);
}

function resolveAuth(auth: Auth, vars: Record<string, string>): Auth {
  const r = (s?: string) => (s == null ? s : resolve(s, vars));
  return {
    ...auth,
    bearerToken: r(auth.bearerToken),
    basicUser: r(auth.basicUser),
    basicPass: r(auth.basicPass),
    apiKeyName: r(auth.apiKeyName),
    apiKeyValue: r(auth.apiKeyValue),
  };
}

const RAW_CONTENT_TYPES: Record<string, string> = {
  json: "application/json",
  xml: "application/xml",
  html: "text/html",
  text: "text/plain",
};

export function prepareRequest(
  req: ApiRequest,
  vars: Record<string, string>,
): PreparedRequest {
  const r = (s: string) => resolve(s, vars);
  const enabled = (kvs: KeyValue[] | undefined) =>
    (kvs ?? []).filter((kv) => kv.enabled && kv.key);

  const auth = buildAuthInjection(resolveAuth(req.auth, vars));

  // URL: resolve, then merge enabled query params + auth query params.
  let url = r(req.url.trim());
  const queryParts: string[] = [];
  for (const p of enabled(req.params)) {
    queryParts.push(`${encodeURIComponent(r(p.key))}=${encodeURIComponent(r(p.value))}`);
  }
  for (const [k, v] of Object.entries(auth.query)) {
    queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  }
  if (queryParts.length) {
    url += (url.includes("?") ? "&" : "?") + queryParts.join("&");
  }

  // Headers: user rows first; auth never overwrites a user-set header.
  const headers: Record<string, string> = {};
  for (const h of enabled(req.headers)) headers[r(h.key)] = r(h.value);
  const authHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(auth.headers)) {
    if (!hasHeader(headers, k)) {
      headers[k] = v;
      authHeaders[k] = v;
    }
  }

  // Body
  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD" && req.body.mode !== "none") {
    switch (req.body.mode) {
      case "json": {
        body = r(req.body.raw ?? "");
        if (!hasHeader(headers, "content-type")) {
          headers["Content-Type"] = "application/json";
        }
        break;
      }
      case "raw": {
        body = r(req.body.raw ?? "");
        if (!hasHeader(headers, "content-type")) {
          headers["Content-Type"] = RAW_CONTENT_TYPES[req.body.rawLang ?? "text"];
        }
        break;
      }
      case "form-data": {
        const fd = new FormData();
        for (const f of enabled(req.body.formData)) fd.append(r(f.key), r(f.value));
        body = fd; // browser sets multipart Content-Type with boundary
        break;
      }
      case "x-www-form-urlencoded": {
        const usp = new URLSearchParams();
        for (const f of enabled(req.body.formData)) usp.append(r(f.key), r(f.value));
        body = usp;
        break;
      }
    }
  }

  return { url, method: req.method, headers, body, authHeaders };
}

export interface SendOptions {
  timeoutMs: number;
  maxBodyBytes: number;
  fetchFn?: typeof fetch; // swappable transport (SPEC §9)
}

export async function sendRequest(
  prepared: PreparedRequest,
  opts: SendOptions,
): Promise<SendResult> {
  const fetchFn = opts.fetchFn ?? fetch;
  const ctrl = new AbortController();
  const timer = setTimeout(
    () => ctrl.abort(new DOMException("Request timed out", "TimeoutError")),
    opts.timeoutMs,
  );
  const start = performance.now();
  try {
    const res = await fetchFn(prepared.url, {
      method: prepared.method,
      headers: prepared.headers,
      body: prepared.body,
      signal: ctrl.signal,
    });
    // Read as Blob: async, no parse, no UI freeze on large bodies (SPEC §2.2).
    const blob = await res.blob();
    const durationMs = performance.now() - start;
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k] = v;
    });
    const bodyTruncated = blob.size > opts.maxBodyBytes;
    return {
      ok: true,
      status: res.status,
      statusText: res.statusText,
      durationMs,
      sizeBytes: blob.size,
      headers,
      contentType: res.headers.get("content-type") ?? "",
      bodyText: bodyTruncated ? "" : await blob.text(),
      bodyTruncated,
      bodyBlob: blob,
    };
  } catch (err) {
    const durationMs = performance.now() - start;
    const isTimeout =
      err instanceof DOMException &&
      (err.name === "TimeoutError" || err.name === "AbortError");
    return {
      ok: false,
      kind: isTimeout ? "timeout" : "cors-or-network",
      message: err instanceof Error ? err.message : String(err),
      durationMs,
    };
  } finally {
    clearTimeout(timer);
  }
}
