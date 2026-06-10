import type { Auth } from "./types";

export interface AuthInjection {
  headers: Record<string, string>;
  query: Record<string, string>;
}

/** Headers / query params an Auth config injects (SPEC §7.3). */
export function buildAuthInjection(auth: Auth): AuthInjection {
  const headers: Record<string, string> = {};
  const query: Record<string, string> = {};

  switch (auth.type) {
    case "bearer":
      if (auth.bearerToken) headers["Authorization"] = `Bearer ${auth.bearerToken}`;
      break;
    case "basic":
      headers["Authorization"] = `Basic ${btoa(`${auth.basicUser ?? ""}:${auth.basicPass ?? ""}`)}`;
      break;
    case "api-key":
      if (auth.apiKeyName) {
        if (auth.apiKeyIn === "query") {
          query[auth.apiKeyName] = auth.apiKeyValue ?? "";
        } else {
          headers[auth.apiKeyName] = auth.apiKeyValue ?? "";
        }
      }
      break;
    case "none":
      break;
  }
  return { headers, query };
}
