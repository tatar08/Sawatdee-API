import { describe, it, expect } from "vitest";
import { prepareRequest, sendRequest, isForbiddenHeader } from "./send";
import type { ApiRequest } from "./types";

function makeReq(over: Partial<ApiRequest> = {}): ApiRequest {
  return {
    id: "r1",
    name: "test",
    method: "GET",
    url: "https://api.example.com/users",
    params: [],
    headers: [],
    body: { mode: "none" },
    auth: { type: "none" },
    createdAt: 0,
    updatedAt: 0,
    ...over,
  };
}

const kv = (key: string, value: string, enabled = true) => ({
  id: crypto.randomUUID(),
  key,
  value,
  enabled,
});

describe("prepareRequest", () => {
  it("merges enabled params into url, appending to existing query", () => {
    const p = prepareRequest(
      makeReq({
        url: "https://x.com/a?z=1",
        params: [kv("q", "hello world"), kv("skip", "no", false)],
      }),
      {},
    );
    expect(p.url).toBe("https://x.com/a?z=1&q=hello%20world");
  });

  it("resolves variables in url, headers, body", () => {
    const p = prepareRequest(
      makeReq({
        method: "POST",
        url: "https://{{host}}/u",
        headers: [kv("X-Env", "{{env}}")],
        body: { mode: "json", raw: '{"a":"{{val}}"}' },
      }),
      { host: "api.x.com", env: "prod", val: "1" },
    );
    expect(p.url).toBe("https://api.x.com/u");
    expect(p.headers["X-Env"]).toBe("prod");
    expect(p.body).toBe('{"a":"1"}');
  });

  it("injects bearer auth; never overwrites user-set header", () => {
    const injected = prepareRequest(
      makeReq({ auth: { type: "bearer", bearerToken: "t" } }),
      {},
    );
    expect(injected.headers["Authorization"]).toBe("Bearer t");
    expect(injected.authHeaders["Authorization"]).toBe("Bearer t");

    const userWins = prepareRequest(
      makeReq({
        headers: [kv("authorization", "custom")],
        auth: { type: "bearer", bearerToken: "t" },
      }),
      {},
    );
    expect(userWins.headers["authorization"]).toBe("custom");
    expect(userWins.headers["Authorization"]).toBeUndefined();
    expect(userWins.authHeaders).toEqual({});
  });

  it("resolves variables in auth fields", () => {
    const p = prepareRequest(
      makeReq({ auth: { type: "bearer", bearerToken: "{{tok}}" } }),
      { tok: "abc" },
    );
    expect(p.headers["Authorization"]).toBe("Bearer abc");
  });

  it("api-key in query lands in url", () => {
    const p = prepareRequest(
      makeReq({
        auth: { type: "api-key", apiKeyName: "key", apiKeyValue: "v", apiKeyIn: "query" },
      }),
      {},
    );
    expect(p.url).toBe("https://api.example.com/users?key=v");
  });

  it("json body sets Content-Type only when absent", () => {
    const auto = prepareRequest(
      makeReq({ method: "POST", body: { mode: "json", raw: "{}" } }),
      {},
    );
    expect(auto.headers["Content-Type"]).toBe("application/json");

    const manual = prepareRequest(
      makeReq({
        method: "POST",
        headers: [kv("content-type", "application/vnd.x+json")],
        body: { mode: "json", raw: "{}" },
      }),
      {},
    );
    expect(manual.headers["Content-Type"]).toBeUndefined();
    expect(manual.headers["content-type"]).toBe("application/vnd.x+json");
  });

  it("urlencoded body builds URLSearchParams from enabled rows", () => {
    const p = prepareRequest(
      makeReq({
        method: "POST",
        body: {
          mode: "x-www-form-urlencoded",
          formData: [kv("a", "1"), kv("b", "2", false)],
        },
      }),
      {},
    );
    expect(p.body).toBeInstanceOf(URLSearchParams);
    expect((p.body as URLSearchParams).toString()).toBe("a=1");
  });

  it("GET ignores body", () => {
    const p = prepareRequest(makeReq({ body: { mode: "json", raw: "{}" } }), {});
    expect(p.body).toBeUndefined();
  });
});

describe("isForbiddenHeader", () => {
  it("flags browser-controlled headers", () => {
    expect(isForbiddenHeader("Host")).toBe(true);
    expect(isForbiddenHeader("cookie")).toBe(true);
    expect(isForbiddenHeader("Sec-Fetch-Mode")).toBe(true);
    expect(isForbiddenHeader("Proxy-Authorization")).toBe(true);
    expect(isForbiddenHeader("Content-Type")).toBe(false);
    expect(isForbiddenHeader("Authorization")).toBe(false);
  });
});

describe("sendRequest", () => {
  const prepared = {
    url: "https://x.com/a",
    method: "GET",
    headers: {},
    authHeaders: {},
  };

  it("captures status, headers, body, size on success", async () => {
    const fetchFn = (async () =>
      new Response('{"ok":true}', {
        status: 201,
        statusText: "Created",
        headers: { "content-type": "application/json" },
      })) as typeof fetch;
    const res = await sendRequest(prepared, {
      timeoutMs: 1000,
      maxBodyBytes: 1000,
      fetchFn,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.status).toBe(201);
      expect(res.statusText).toBe("Created");
      expect(res.bodyText).toBe('{"ok":true}');
      expect(res.sizeBytes).toBe(11);
      expect(res.headers["content-type"]).toBe("application/json");
      expect(res.bodyTruncated).toBe(false);
      expect(res.durationMs).toBeGreaterThanOrEqual(0);
    }
  });

  it("4xx/5xx is still ok:true (transport success)", async () => {
    const fetchFn = (async () => new Response("nope", { status: 500 })) as typeof fetch;
    const res = await sendRequest(prepared, {
      timeoutMs: 1000,
      maxBodyBytes: 1000,
      fetchFn,
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.status).toBe(500);
  });

  it("thrown TypeError maps to cors-or-network", async () => {
    const fetchFn = (async () => {
      throw new TypeError("Failed to fetch");
    }) as typeof fetch;
    const res = await sendRequest(prepared, {
      timeoutMs: 1000,
      maxBodyBytes: 1000,
      fetchFn,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.kind).toBe("cors-or-network");
      expect(res.message).toBe("Failed to fetch");
    }
  });

  it("aborts after timeoutMs and maps to timeout", async () => {
    const fetchFn = ((_url: unknown, init?: RequestInit) =>
      new Promise((_, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(init.signal!.reason ?? new DOMException("aborted", "AbortError")),
        );
      })) as unknown as typeof fetch;
    const res = await sendRequest(prepared, {
      timeoutMs: 10,
      maxBodyBytes: 1000,
      fetchFn,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.kind).toBe("timeout");
  });

  it("truncates oversized bodies but keeps blob + size", async () => {
    const big = "x".repeat(5000);
    const fetchFn = (async () => new Response(big, { status: 200 })) as typeof fetch;
    const res = await sendRequest(prepared, {
      timeoutMs: 1000,
      maxBodyBytes: 1000,
      fetchFn,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.bodyTruncated).toBe(true);
      expect(res.bodyText).toBe("");
      expect(res.sizeBytes).toBe(5000);
      expect(res.bodyBlob.size).toBe(5000);
    }
  });
});
