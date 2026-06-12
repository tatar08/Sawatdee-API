import { describe, it, expect } from "vitest";
import {
  detectFormat,
  importFile,
  importPostmanCollection,
  importPostmanEnvironment,
  importNative,
  exportPostmanCollection,
  exportPostmanEnvironment,
  exportNative,
} from "./importExport";
import type { ApiRequest, Collection, Environment, Settings } from "./types";

const NOW = 1_700_000_000_000;

// Realistic Postman v2.1 export: nested folder, bearer/oauth2 auth, query
// array, raw-json body, file form field, test script.
const pmCollection = {
  info: {
    _postman_id: "abc-123",
    name: "Demo API",
    description: "demo",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: [
    {
      name: "List users",
      request: {
        method: "GET",
        header: [{ key: "Accept", value: "application/json" }],
        url: {
          raw: "https://{{host}}/users?page=1",
          protocol: "https",
          host: ["{{host}}"],
          path: ["users"],
          query: [
            { key: "page", value: "1" },
            { key: "limit", value: "10", disabled: true },
          ],
        },
      },
      response: [],
    },
    {
      name: "Admin",
      item: [
        {
          name: "Delete user",
          event: [
            {
              listen: "test",
              script: { exec: ["pm.test('ok', () => {})"], type: "text/javascript" },
            },
          ],
          request: {
            method: "DELETE",
            auth: {
              type: "bearer",
              bearer: [{ key: "token", value: "{{token}}", type: "string" }],
            },
            url: "https://{{host}}/users/1",
          },
          response: [],
        },
      ],
    },
    {
      name: "Create user",
      request: {
        method: "POST",
        url: {
          raw: "https://{{host}}/users",
          protocol: "https",
          host: ["{{host}}"],
          path: ["users"],
        },
        body: {
          mode: "raw",
          raw: '{"name":"Ada"}',
          options: { raw: { language: "json" } },
        },
        auth: {
          type: "oauth2",
          oauth2: [{ key: "grant_type", value: "authorization_code" }],
        },
      },
      response: [],
    },
    {
      name: "Upload",
      request: {
        method: "POST",
        url: "https://{{host}}/upload",
        body: {
          mode: "formdata",
          formdata: [
            { key: "title", value: "pic" },
            { key: "file", type: "file", src: "/tmp/cat.png" },
          ],
        },
      },
      response: [],
    },
  ],
  variable: [{ key: "host", value: "api.example.com" }],
};

const pmEnvironment = {
  id: "env-1",
  name: "Production",
  values: [
    { key: "host", value: "api.example.com", enabled: true, type: "default" },
    { key: "token", value: "s3cret", enabled: false, type: "secret" },
  ],
  _postman_variable_scope: "environment",
  _exporter_id: "10101",
};

describe("detectFormat", () => {
  it("detects all three formats and unknown", () => {
    expect(detectFormat(pmCollection)).toBe("postman-collection");
    expect(detectFormat(pmEnvironment)).toBe("postman-environment");
    expect(detectFormat({ sawatdeeApiVersion: 1 })).toBe("sawatdee-api-native");
    expect(detectFormat({ random: true })).toBe("unknown");
    expect(detectFormat(null)).toBe("unknown");
    expect(detectFormat("str")).toBe("unknown");
  });
});

describe("importPostmanCollection", () => {
  const report = importPostmanCollection(pmCollection, NOW);
  const [col] = report.collections;
  const byName = (n: string) => report.requests.find((r) => r.name === n)!;

  it("imports collection meta + variables", () => {
    expect(col.name).toBe("Demo API");
    expect(col.description).toBe("demo");
    expect(col.variables).toHaveLength(1);
    expect(col.variables![0]).toMatchObject({ key: "host", value: "api.example.com" });
    expect(col.requestIds).toHaveLength(4);
  });

  it("flattens folders with path-prefixed names", () => {
    expect(report.requests.map((r) => r.name)).toEqual([
      "List users",
      "Admin / Delete user",
      "Create user",
      "Upload",
    ]);
    for (const r of report.requests) expect(r.collectionId).toBe(col.id);
  });

  it("moves url.query[] into params and strips query from raw", () => {
    const r = byName("List users");
    expect(r.url).toBe("https://{{host}}/users");
    expect(r.params).toHaveLength(2);
    expect(r.params[0]).toMatchObject({ key: "page", value: "1", enabled: true });
    expect(r.params[1]).toMatchObject({ key: "limit", value: "10", enabled: false });
    expect(r.headers[0]).toMatchObject({ key: "Accept", value: "application/json" });
  });

  it("maps bearer auth and preserves scripts", () => {
    const r = byName("Admin / Delete user");
    expect(r.method).toBe("DELETE");
    expect(r.auth).toEqual({ type: "bearer", bearerToken: "{{token}}" });
    expect(r.postmanEvents).toBeDefined();
    expect(report.warnings.some((w) => w.includes("scripts"))).toBe(true);
  });

  it("maps raw-json body; stashes unsupported oauth2 with warning", () => {
    const r = byName("Create user");
    expect(r.body).toEqual({ mode: "json", raw: '{"name":"Ada"}', rawLang: "json" });
    expect(r.auth.type).toBe("none");
    expect(r.postmanAuthRaw).toMatchObject({ type: "oauth2" });
    expect(report.warnings.some((w) => w.includes("oauth2"))).toBe(true);
  });

  it("drops file form fields with warning, keeps text fields", () => {
    const r = byName("Upload");
    expect(r.body.mode).toBe("form-data");
    expect(r.body.formData).toHaveLength(1);
    expect(r.body.formData![0]).toMatchObject({ key: "title", value: "pic" });
    expect(report.warnings.some((w) => w.includes("file field"))).toBe(true);
  });
});

describe("importPostmanEnvironment", () => {
  const report = importPostmanEnvironment(pmEnvironment);
  const [env] = report.environments;

  it("maps name + values with enabled flags", () => {
    expect(env.name).toBe("Production");
    expect(env.variables).toHaveLength(2);
    expect(env.variables[0]).toMatchObject({
      key: "host",
      value: "api.example.com",
      enabled: true,
    });
    expect(env.variables[1]).toMatchObject({ key: "token", enabled: false });
  });

  it("warns about secret variables", () => {
    expect(report.warnings.some((w) => w.includes("secret"))).toBe(true);
  });
});

describe("Postman round-trip (import → export → import)", () => {
  it("loses nothing Sawatdee API understands, including stashed fields", () => {
    const first = importPostmanCollection(pmCollection, NOW);
    const exported = exportPostmanCollection(first.collections[0], first.requests);
    expect(detectFormat(exported)).toBe("postman-collection");
    const second = importPostmanCollection(exported, NOW);

    const strip = (r: ApiRequest) => ({
      name: r.name,
      method: r.method,
      url: r.url,
      params: r.params.map(({ key, value, enabled }) => ({ key, value, enabled })),
      headers: r.headers.map(({ key, value, enabled }) => ({ key, value, enabled })),
      body: r.body.mode === "form-data"
        ? {
            mode: r.body.mode,
            formData: r.body.formData!.map(({ key, value, enabled }) => ({ key, value, enabled })),
          }
        : r.body,
      auth: r.auth,
      postmanEvents: r.postmanEvents,
      postmanAuthRaw: r.postmanAuthRaw,
    });
    expect(second.requests.map(strip)).toEqual(first.requests.map(strip));
    expect(second.collections[0].name).toBe(first.collections[0].name);
    expect(
      second.collections[0].variables!.map(({ key, value }) => ({ key, value })),
    ).toEqual(first.collections[0].variables!.map(({ key, value }) => ({ key, value })));
  });

  it("environment round-trips", () => {
    const first = importPostmanEnvironment(pmEnvironment);
    const exported = exportPostmanEnvironment(first.environments[0]);
    expect(detectFormat(exported)).toBe("postman-environment");
    const second = importPostmanEnvironment(exported);
    const strip = (e: Environment) =>
      e.variables.map(({ key, value, enabled }) => ({ key, value, enabled }));
    expect(strip(second.environments[0])).toEqual(strip(first.environments[0]));
    expect(second.environments[0].name).toBe("Production");
  });
});

describe("native bundle", () => {
  const req: ApiRequest = {
    id: "r1",
    name: "Get thing",
    method: "GET",
    url: "https://{{host}}/thing",
    params: [{ id: "p1", key: "q", value: "1", enabled: true }],
    headers: [],
    body: { mode: "none" },
    auth: { type: "bearer", bearerToken: "{{tok}}" },
    collectionId: "c1",
    createdAt: NOW,
    updatedAt: NOW,
    postmanEvents: [{ listen: "test" }],
  };
  const col: Collection = {
    id: "c1",
    name: "Things",
    requestIds: ["r1"],
    createdAt: NOW,
    updatedAt: NOW,
  };
  const env: Environment = {
    id: "e1",
    name: "Dev",
    variables: [{ id: "v1", key: "host", value: "localhost", enabled: true }],
  };
  const settings: Settings = {
    activeEnvironmentId: "e1",
    reduceTransparency: false,
    requestTimeoutMs: 30000,
    maxResponsePreviewBytes: 2_000_000,
    themePattern: "none",
    themeMode: "light",
    language: "en",
  };

  it("export → import is fully lossless", () => {
    const bundle = exportNative([col], [req], [env], settings);
    expect(detectFormat(bundle)).toBe("sawatdee-api-native");
    // simulate file round-trip through JSON
    const back = importNative(JSON.parse(JSON.stringify(bundle)));
    expect(back.collections).toEqual([col]);
    expect(back.requests).toEqual([req]);
    expect(back.environments).toEqual([env]);
    expect(back.settings).toEqual(settings);
    expect(back.warnings).toEqual([]);
  });
});

describe("importFile dispatcher", () => {
  it("dispatches by shape", () => {
    expect(importFile(pmCollection, NOW).collections).toHaveLength(1);
    expect(importFile(pmEnvironment, NOW).environments).toHaveLength(1);
  });

  it("throws friendly error on unknown format", () => {
    expect(() => importFile({ nope: 1 }, NOW)).toThrow(/Unrecognized file/);
  });

  it("throws friendly error on invalid postman collection", () => {
    const bad = { info: { _postman_id: "x" }, item: [] }; // missing info.name
    expect(() => importFile(bad, NOW)).toThrow(/Invalid postman-collection/);
  });
});
