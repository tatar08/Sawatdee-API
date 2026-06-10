import { describe, it, expect } from "vitest";
import { buildAuthInjection } from "./auth";

describe("buildAuthInjection", () => {
  it("none injects nothing", () => {
    expect(buildAuthInjection({ type: "none" })).toEqual({ headers: {}, query: {} });
  });

  it("bearer", () => {
    expect(buildAuthInjection({ type: "bearer", bearerToken: "t0k" }).headers).toEqual({
      Authorization: "Bearer t0k",
    });
  });

  it("bearer with empty token injects nothing", () => {
    expect(buildAuthInjection({ type: "bearer" }).headers).toEqual({});
  });

  it("basic base64-encodes user:pass", () => {
    expect(
      buildAuthInjection({ type: "basic", basicUser: "ada", basicPass: "pw" }).headers,
    ).toEqual({ Authorization: `Basic ${btoa("ada:pw")}` });
  });

  it("api-key in header", () => {
    expect(
      buildAuthInjection({
        type: "api-key",
        apiKeyName: "X-Key",
        apiKeyValue: "v",
        apiKeyIn: "header",
      }).headers,
    ).toEqual({ "X-Key": "v" });
  });

  it("api-key in query", () => {
    const inj = buildAuthInjection({
      type: "api-key",
      apiKeyName: "api_key",
      apiKeyValue: "v",
      apiKeyIn: "query",
    });
    expect(inj.query).toEqual({ api_key: "v" });
    expect(inj.headers).toEqual({});
  });
});
