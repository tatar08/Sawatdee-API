export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export type BodyMode = "none" | "json" | "raw" | "form-data" | "x-www-form-urlencoded";

export interface RequestBody {
  mode: BodyMode;
  raw?: string; // json / raw text
  rawLang?: "json" | "text" | "xml" | "html";
  formData?: KeyValue[]; // form-data / urlencoded
}

export type AuthType = "none" | "bearer" | "basic" | "api-key";

export interface Auth {
  type: AuthType;
  bearerToken?: string;
  basicUser?: string;
  basicPass?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyIn?: "header" | "query";
}

export interface ApiRequest {
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
  // Lossless round-trip stash for Postman fields we don't model/execute (SPEC §7.5):
  postmanEvents?: unknown; // prerequest/test scripts — preserved, not run
  postmanAuthRaw?: unknown; // unsupported auth blocks (oauth2, awsv4, …)
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  requestIds: string[]; // ordered
  // Postman collection-level variable[] — resolved after environment vars (SPEC §7.1/§7.5)
  variables?: KeyValue[];
  createdAt: number;
  updatedAt: number;
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValue[]; // {{var}} resolution source
}

export interface HistoryEntry {
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

export type ThemePattern = "none" | "dog" | "cat" | "rabbit" | "panda" | "elephant" | "kitsune" | "dragon" | "deer" | "koi" | "owl" | "turtle" | "butterfly" | "crane" | "naga" | "tiger" | "suvarnabhumi" | "ayutthaya" | "bangkok" | "cybersiam";
export type ThemeMode = "light" | "dark";
export type AppLanguage = "en" | "th";

export interface Settings {
  activeEnvironmentId: string | null;
  reduceTransparency: boolean;
  requestTimeoutMs: number; // default 30000
  maxResponsePreviewBytes: number; // default 2_000_000
  themePattern?: ThemePattern;
  themeMode?: ThemeMode;
  language?: AppLanguage;
}

