import { z } from "zod";
import type {
  ApiRequest,
  Auth,
  Collection,
  Environment,
  HttpMethod,
  KeyValue,
  RequestBody,
  Settings,
} from "./types";

/**
 * Import / Export — Postman-compatible (SPEC §7.5).
 *
 * ROUND-TRIP CONTRACT
 * - Import → export → import must not lose data Sawatdee API understands.
 * - Postman fields we don't model or execute are stashed verbatim on the
 *   request record and re-emitted on export:
 *     - `postmanEvents`   — prerequest/test scripts (never executed)
 *     - `postmanAuthRaw`  — unsupported auth blocks (oauth2, awsv4, …),
 *       imported as auth.type "none" + warning
 * - Inline URL query strings are normalized into params[] on import; on
 *   export both inline and row params are emitted in `url.query` and merged
 *   into `url.raw`. Semantically lossless (the request sent is identical).
 * - Every importer validates with Zod and returns a structured report
 *   ({ warnings, skipped }) — never fails silently, never hard-crashes on
 *   unexpected fields (schemas are passthrough).
 */

export const POSTMAN_SCHEMA_URL =
  "https://schema.getpostman.com/json/collection/v2.1.0/collection.json";

// ---------------------------------------------------------------- helpers

const newId = () => crypto.randomUUID();

function descText(d: unknown): string | undefined {
  if (typeof d === "string") return d;
  if (d && typeof d === "object" && typeof (d as { content?: unknown }).content === "string") {
    return (d as { content: string }).content;
  }
  return undefined;
}

// ------------------------------------------------- Postman v2.1 schemas

const zPmKv = z
  .object({
    key: z.string().nullish(),
    value: z.string().nullish(),
    disabled: z.boolean().optional(),
    description: z.unknown().optional(),
  })
  .passthrough();

const zPmUrl = z.union([
  z.string(),
  z
    .object({
      raw: z.string().optional(),
      protocol: z.string().optional(),
      host: z.union([z.string(), z.array(z.string())]).optional(),
      path: z.union([z.string(), z.array(z.string())]).optional(),
      port: z.string().optional(),
      query: z.array(zPmKv).optional(),
    })
    .passthrough(),
]);

const zPmBody = z
  .object({
    mode: z.string().optional(),
    raw: z.string().optional(),
    options: z
      .object({ raw: z.object({ language: z.string().optional() }).passthrough().optional() })
      .passthrough()
      .optional(),
    formdata: z
      .array(zPmKv.extend({ type: z.string().optional(), src: z.unknown().optional() }))
      .optional(),
    urlencoded: z.array(zPmKv).optional(),
  })
  .passthrough();

const zPmAuth = z.object({ type: z.string().optional() }).passthrough();

const zPmRequest = z.union([
  z.string(), // shorthand: bare URL
  z
    .object({
      method: z.string().optional(),
      url: zPmUrl.nullish(),
      header: z.array(zPmKv).nullish(),
      body: zPmBody.nullish(),
      auth: zPmAuth.nullish(),
      description: z.unknown().optional(),
    })
    .passthrough(),
]);

const zPmItem: z.ZodTypeAny = z.lazy(() =>
  z
    .object({
      name: z.string().optional(),
      item: z.array(zPmItem).optional(),
      request: zPmRequest.nullish(),
      event: z.unknown().optional(),
    })
    .passthrough(),
);

export const zPostmanCollection = z
  .object({
    info: z
      .object({
        name: z.string(),
        schema: z.string().optional(),
        _postman_id: z.string().optional(),
        description: z.unknown().optional(),
      })
      .passthrough(),
    item: z.array(zPmItem),
    variable: z.array(zPmKv).optional(),
  })
  .passthrough();

export const zPostmanEnvironment = z
  .object({
    name: z.string(),
    values: z.array(
      z
        .object({
          key: z.string(),
          value: z.unknown().optional(),
          enabled: z.boolean().optional(),
          type: z.string().optional(),
        })
        .passthrough(),
    ),
    _postman_variable_scope: z.string().optional(),
  })
  .passthrough();

// ------------------------------------------------- Native bundle schemas

const zKeyValue = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  enabled: z.boolean(),
  description: z.string().optional(),
});

const zBody = z.object({
  mode: z.enum(["none", "json", "raw", "form-data", "x-www-form-urlencoded"]),
  raw: z.string().optional(),
  rawLang: z.enum(["json", "text", "xml", "html"]).optional(),
  formData: z.array(zKeyValue).optional(),
});

const zAuth = z.object({
  type: z.enum(["none", "bearer", "basic", "api-key"]),
  bearerToken: z.string().optional(),
  basicUser: z.string().optional(),
  basicPass: z.string().optional(),
  apiKeyName: z.string().optional(),
  apiKeyValue: z.string().optional(),
  apiKeyIn: z.enum(["header", "query"]).optional(),
});

const zApiRequest = z.object({
  id: z.string(),
  name: z.string(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
  url: z.string(),
  params: z.array(zKeyValue),
  headers: z.array(zKeyValue),
  body: zBody,
  auth: zAuth,
  collectionId: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  postmanEvents: z.unknown().optional(),
  postmanAuthRaw: z.unknown().optional(),
});

const zCollection = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  requestIds: z.array(z.string()),
  variables: z.array(zKeyValue).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const zEnvironment = z.object({
  id: z.string(),
  name: z.string(),
  variables: z.array(zKeyValue),
});

const zSettings: z.ZodType<Settings> = z.object({
  activeEnvironmentId: z.string().nullable(),
  reduceTransparency: z.boolean(),
  requestTimeoutMs: z.number(),
  maxResponsePreviewBytes: z.number(),
  themePattern: z.enum(["none", "dog", "cat", "rabbit", "panda", "elephant", "kitsune", "dragon", "deer", "koi", "owl", "turtle", "butterfly", "crane", "naga", "tiger", "suvarnabhumi", "ayutthaya", "bangkok", "cybersiam"]).optional().default("none"),
  themeMode: z.enum(["light", "dark"]).optional().default("light"),
  language: z.enum(["en", "th"]).optional().default("en"),
});

export const zNativeBundle = z.object({
  sawatdeeApiVersion: z.literal(1).optional(),
  postgirlVersion: z.literal(1).optional(),
  collections: z.array(zCollection).default([]),
  requests: z.array(zApiRequest).default([]),
  environments: z.array(zEnvironment).default([]),
  settings: zSettings.optional(),
});

// ------------------------------------------------------ format detection

export type DetectedFormat =
  | "postman-collection"
  | "postman-environment"
  | "sawatdee-api-native"
  | "unknown";

export function detectFormat(data: unknown): DetectedFormat {
  if (!data || typeof data !== "object") return "unknown";
  const o = data as Record<string, unknown>;
  if (typeof o.sawatdeeApiVersion === "number" || typeof o.postgirlVersion === "number") {
    return "sawatdee-api-native";
  }
  const info = o.info as Record<string, unknown> | undefined;
  if (
    info &&
    Array.isArray(o.item) &&
    ("_postman_id" in info ||
      (typeof info.schema === "string" && info.schema.includes("collection")))
  ) {
    return "postman-collection";
  }
  if (
    o._postman_variable_scope === "environment" ||
    (typeof o.name === "string" && Array.isArray(o.values))
  ) {
    return "postman-environment";
  }
  return "unknown";
}

// --------------------------------------------------------------- reports

export interface ImportReport {
  collections: Collection[];
  requests: ApiRequest[];
  environments: Environment[];
  settings?: Settings;
  warnings: string[];
  skipped: string[];
}

const emptyReport = (): ImportReport => ({
  collections: [],
  requests: [],
  environments: [],
  warnings: [],
  skipped: [],
});

// ------------------------------------------------- Postman → Sawatdee API

function kvFromPm(kv: z.infer<typeof zPmKv>): KeyValue {
  return {
    id: newId(),
    key: kv.key ?? "",
    value: kv.value ?? "",
    enabled: kv.disabled !== true,
    description: descText(kv.description),
  };
}

function pmUrlToSawatdeeApi(u: z.infer<typeof zPmUrl> | null | undefined): {
  url: string;
  params: KeyValue[];
} {
  if (u == null) return { url: "", params: [] };
  if (typeof u === "string") return { url: u, params: [] };
  const params = (u.query ?? []).map(kvFromPm);
  let raw = u.raw;
  if (!raw) {
    const host = Array.isArray(u.host) ? u.host.join(".") : (u.host ?? "");
    const path = Array.isArray(u.path) ? u.path.join("/") : (u.path ?? "");
    raw = `${u.protocol ? `${u.protocol}://` : ""}${host}${u.port ? `:${u.port}` : ""}${
      path ? `/${path.replace(/^\//, "")}` : ""
    }`;
  } else if (params.length) {
    raw = raw.split("?")[0]; // query now lives in params[]
  }
  return { url: raw, params };
}

const METHODS: readonly HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

function normalizeMethod(m: string | undefined, name: string, warnings: string[]): HttpMethod {
  const up = (m ?? "GET").toUpperCase();
  if ((METHODS as readonly string[]).includes(up)) return up as HttpMethod;
  warnings.push(`"${name}": method "${m}" not supported — defaulted to GET`);
  return "GET";
}

function pmBodyToSawatdeeApi(
  b: z.infer<typeof zPmBody> | null | undefined,
  name: string,
  warnings: string[],
): RequestBody {
  if (!b?.mode) return { mode: "none" };
  switch (b.mode) {
    case "raw": {
      const lang = b.options?.raw?.language;
      if (lang === "json") return { mode: "json", raw: b.raw ?? "", rawLang: "json" };
      const rawLang =
        lang === "xml" || lang === "html" || lang === "text" ? lang : "text";
      return { mode: "raw", raw: b.raw ?? "", rawLang };
    }
    case "formdata": {
      const entries = b.formdata ?? [];
      const files = entries.filter((e) => e.type === "file");
      if (files.length) {
        warnings.push(
          `"${name}": ${files.length} file field(s) dropped (browser limitation)`,
        );
      }
      return {
        mode: "form-data",
        formData: entries.filter((e) => e.type !== "file").map(kvFromPm),
      };
    }
    case "urlencoded":
      return { mode: "x-www-form-urlencoded", formData: (b.urlencoded ?? []).map(kvFromPm) };
    default:
      warnings.push(`"${name}": body mode "${b.mode}" not supported — set to none`);
      return { mode: "none" };
  }
}

function pmAuthToSawatdeeApi(
  a: z.infer<typeof zPmAuth> | null | undefined,
  name: string,
  warnings: string[],
): { auth: Auth; raw?: unknown } {
  if (!a?.type || a.type === "noauth") return { auth: { type: "none" } };
  const block = (a as Record<string, unknown>)[a.type];
  const get = (key: string): string => {
    if (Array.isArray(block)) {
      const found = (block as { key?: string; value?: unknown }[]).find((p) => p.key === key);
      return typeof found?.value === "string" ? found.value : String(found?.value ?? "");
    }
    if (block && typeof block === "object") {
      const v = (block as Record<string, unknown>)[key];
      return typeof v === "string" ? v : "";
    }
    return "";
  };
  switch (a.type) {
    case "bearer":
      return { auth: { type: "bearer", bearerToken: get("token") } };
    case "basic":
      return {
        auth: { type: "basic", basicUser: get("username"), basicPass: get("password") },
      };
    case "apikey":
      return {
        auth: {
          type: "api-key",
          apiKeyName: get("key"),
          apiKeyValue: get("value"),
          apiKeyIn: get("in") === "query" ? "query" : "header",
        },
      };
    default:
      warnings.push(
        `"${name}": auth type "${a.type}" not supported — imported as none (preserved for re-export)`,
      );
      return { auth: { type: "none" }, raw: a };
  }
}

interface PmItem {
  name?: string;
  item?: PmItem[];
  request?: z.infer<typeof zPmRequest> | null;
  event?: unknown;
}

export function importPostmanCollection(data: unknown, now: number): ImportReport {
  const parsed = zPostmanCollection.parse(data);
  const report = emptyReport();
  let scriptCount = 0;

  const walk = (items: PmItem[], prefix: string) => {
    for (const item of items) {
      if (item.item) {
        // Folder: flatten, prefix request names with the folder path (SPEC §7.5)
        const folderName = item.name ?? "Folder";
        walk(item.item, prefix ? `${prefix} / ${folderName}` : folderName);
        continue;
      }
      if (item.request == null) {
        report.skipped.push(`Item "${item.name ?? "(unnamed)"}" has no request`);
        continue;
      }
      const name = prefix
        ? `${prefix} / ${item.name ?? "Request"}`
        : (item.name ?? "Request");
      const pm = typeof item.request === "string" ? { url: item.request } : item.request;
      const { url, params } = pmUrlToSawatdeeApi(pm.url);
      const { auth, raw: authRaw } = pmAuthToSawatdeeApi(pm.auth, name, report.warnings);
      const req: ApiRequest = {
        id: newId(),
        name,
        method: normalizeMethod(pm.method, name, report.warnings),
        url,
        params,
        headers: (pm.header ?? []).map(kvFromPm),
        body: pmBodyToSawatdeeApi(pm.body, name, report.warnings),
        auth,
        createdAt: now,
        updatedAt: now,
      };
      if (authRaw != null) req.postmanAuthRaw = authRaw;
      if (item.event != null) {
        req.postmanEvents = item.event;
        scriptCount++;
      }
      report.requests.push(req);
    }
  };
  walk(parsed.item as PmItem[], "");

  const collection: Collection = {
    id: newId(),
    name: parsed.info.name,
    description: descText(parsed.info.description),
    requestIds: report.requests.map((r) => r.id),
    variables: parsed.variable?.map(kvFromPm),
    createdAt: now,
    updatedAt: now,
  };
  for (const r of report.requests) r.collectionId = collection.id;
  report.collections.push(collection);

  if (scriptCount) {
    report.warnings.push(
      `${scriptCount} request(s) contain pre-request/test scripts — preserved for export but not run`,
    );
  }
  return report;
}

export function importPostmanEnvironment(data: unknown): ImportReport {
  const parsed = zPostmanEnvironment.parse(data);
  const report = emptyReport();
  report.environments.push({
    id: newId(),
    name: parsed.name,
    variables: parsed.values.map((v) => ({
      id: newId(),
      key: v.key,
      value: typeof v.value === "string" ? v.value : String(v.value ?? ""),
      enabled: v.enabled !== false,
    })),
  });
  if (parsed.values.some((v) => v.type === "secret")) {
    report.warnings.push(
      'Environment contains "secret" variables — Sawatdee API stores but does not mask values in v1',
    );
  }
  return report;
}

export function importNative(data: unknown): ImportReport {
  const parsed = zNativeBundle.parse(data);
  return {
    collections: parsed.collections,
    requests: parsed.requests,
    environments: parsed.environments,
    settings: parsed.settings,
    warnings: [],
    skipped: [],
  };
}

/** Dispatch by detected shape. Throws Error with a friendly message on failure. */
export function importFile(data: unknown, now: number): ImportReport {
  const format = detectFormat(data);
  try {
    switch (format) {
      case "postman-collection":
        return importPostmanCollection(data, now);
      case "postman-environment":
        return importPostmanEnvironment(data);
      case "sawatdee-api-native":
        return importNative(data);
      default:
        throw new Error(
          "Unrecognized file — expected a Postman collection v2.1, a Postman environment, or a Sawatdee API bundle.",
        );
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const first = err.issues[0];
      throw new Error(
        `Invalid ${format} file: ${first?.message ?? "schema mismatch"} at ${
          first?.path.join(".") || "(root)"
        }`,
      );
    }
    throw err;
  }
}

// ------------------------------------------------- Sawatdee API → Postman

function pmKv(kv: KeyValue): Record<string, unknown> {
  const out: Record<string, unknown> = { key: kv.key, value: kv.value };
  if (!kv.enabled) out.disabled = true;
  if (kv.description) out.description = kv.description;
  return out;
}

function splitInlineQuery(url: string): {
  base: string;
  inline: { key: string; value: string }[];
} {
  const i = url.indexOf("?");
  if (i < 0) return { base: url, inline: [] };
  const inline = url
    .slice(i + 1)
    .split("&")
    .filter(Boolean)
    .map((pair) => {
      const j = pair.indexOf("=");
      return j < 0
        ? { key: pair, value: "" }
        : { key: pair.slice(0, j), value: pair.slice(j + 1) };
    });
  return { base: url.slice(0, i), inline };
}

function pmUrlFromRequest(r: ApiRequest): Record<string, unknown> {
  const { base, inline } = splitInlineQuery(r.url);
  const enabledParams = r.params.filter((p) => p.enabled && p.key);
  const allPairs = [
    ...inline,
    ...enabledParams.map((p) => ({ key: p.key, value: p.value })),
  ];
  const qs = allPairs.map((p) => `${p.key}=${p.value}`).join("&");
  const out: Record<string, unknown> = { raw: qs ? `${base}?${qs}` : base };
  const query = [
    ...inline.map((p) => ({ key: p.key, value: p.value })),
    ...r.params.map(pmKv),
  ];
  if (query.length) out.query = query;
  return out;
}

function pmBodyFromRequest(r: ApiRequest): Record<string, unknown> | undefined {
  switch (r.body.mode) {
    case "none":
      return undefined;
    case "json":
      return { mode: "raw", raw: r.body.raw ?? "", options: { raw: { language: "json" } } };
    case "raw":
      return {
        mode: "raw",
        raw: r.body.raw ?? "",
        options: { raw: { language: r.body.rawLang ?? "text" } },
      };
    case "form-data":
      return { mode: "formdata", formdata: (r.body.formData ?? []).map(pmKv) };
    case "x-www-form-urlencoded":
      return { mode: "urlencoded", urlencoded: (r.body.formData ?? []).map(pmKv) };
  }
}

function pmAuthFromRequest(r: ApiRequest): unknown {
  switch (r.auth.type) {
    case "none":
      return r.postmanAuthRaw ?? undefined; // lossless re-export of stashed auth
    case "bearer":
      return {
        type: "bearer",
        bearer: [{ key: "token", value: r.auth.bearerToken ?? "", type: "string" }],
      };
    case "basic":
      return {
        type: "basic",
        basic: [
          { key: "username", value: r.auth.basicUser ?? "", type: "string" },
          { key: "password", value: r.auth.basicPass ?? "", type: "string" },
        ],
      };
    case "api-key":
      return {
        type: "apikey",
        apikey: [
          { key: "key", value: r.auth.apiKeyName ?? "", type: "string" },
          { key: "value", value: r.auth.apiKeyValue ?? "", type: "string" },
          { key: "in", value: r.auth.apiKeyIn ?? "header", type: "string" },
        ],
      };
  }
}

export function exportPostmanCollection(col: Collection, reqs: ApiRequest[]): unknown {
  return {
    info: {
      _postman_id: col.id,
      name: col.name,
      ...(col.description ? { description: col.description } : {}),
      schema: POSTMAN_SCHEMA_URL,
      _exporter_id: "Sawatdee API",
    },
    item: reqs.map((r) => {
      const body = pmBodyFromRequest(r);
      const auth = pmAuthFromRequest(r);
      const item: Record<string, unknown> = {
        name: r.name,
        request: {
          method: r.method,
          header: r.headers.map(pmKv),
          url: pmUrlFromRequest(r),
          ...(body ? { body } : {}),
          ...(auth ? { auth } : {}),
        },
        response: [],
      };
      if (r.postmanEvents != null) item.event = r.postmanEvents;
      return item;
    }),
    ...(col.variables?.length ? { variable: col.variables.map(pmKv) } : {}),
  };
}

export function exportPostmanEnvironment(env: Environment): unknown {
  return {
    id: env.id,
    name: env.name,
    values: env.variables.map((v) => ({
      key: v.key,
      value: v.value,
      enabled: v.enabled,
      type: "default",
    })),
    _postman_variable_scope: "environment",
    _exporter_id: "Sawatdee API",
  };
}

// ----------------------------------------------------------- native export

export function exportNative(
  collections: Collection[],
  requests: ApiRequest[],
  environments: Environment[],
  settings?: Settings,
): unknown {
  return {
    sawatdeeApiVersion: 1,
    collections,
    requests,
    environments,
    ...(settings ? { settings } : {}),
  };
}
