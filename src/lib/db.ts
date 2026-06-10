import Dexie, { type EntityTable } from "dexie";
import type {
  ApiRequest,
  Collection,
  Environment,
  HistoryEntry,
  Settings,
} from "./types";

export interface SettingsRow extends Settings {
  id: string; // single row, id = "app"
}

export const db = new Dexie("postgirl") as Dexie & {
  collections: EntityTable<Collection, "id">;
  requests: EntityTable<ApiRequest, "id">;
  environments: EntityTable<Environment, "id">;
  history: EntityTable<HistoryEntry, "id">;
  settings: EntityTable<SettingsRow, "id">;
};

db.version(1).stores({
  collections: "id, name, updatedAt",
  requests: "id, collectionId, updatedAt",
  environments: "id, name",
  history: "id, sentAt",
  settings: "id",
});

export const DEFAULT_SETTINGS: Settings = {
  activeEnvironmentId: null,
  reduceTransparency: false,
  requestTimeoutMs: 30_000,
  maxResponsePreviewBytes: 2_000_000,
};

export const HISTORY_CAP = 100;

export async function pushHistory(entry: HistoryEntry): Promise<void> {
  await db.history.add(entry);
  const count = await db.history.count();
  if (count > HISTORY_CAP) {
    const oldest = await db.history
      .orderBy("sentAt")
      .limit(count - HISTORY_CAP)
      .primaryKeys();
    await db.history.bulkDelete(oldest);
  }
}

export async function loadSettings(): Promise<Settings> {
  const row = await db.settings.get("app");
  return row ? { ...DEFAULT_SETTINGS, ...row } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await db.settings.put({ id: "app", ...settings });
}
