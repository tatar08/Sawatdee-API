import { create } from "zustand";
import type {
  ApiRequest,
  Collection,
  Environment,
  HistoryEntry,
  Settings,
} from "../lib/types";
import { db, DEFAULT_SETTINGS, pushHistory, loadSettings, saveSettings } from "../lib/db";
import { buildVars } from "../lib/variables";
import { prepareRequest, sendRequest, getFetchFn, type SendResult } from "../lib/send";
import type { ImportReport } from "../lib/importExport";

export interface TabState {
  request: ApiRequest; // working copy; tab id === request id
  /** true = never saved to a collection (draft) */
  draft: boolean;
  result: SendResult | null;
  sending: boolean;
}

function blankRequest(): ApiRequest {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name: "Untitled request",
    method: "GET",
    url: "",
    params: [],
    headers: [],
    body: { mode: "none" },
    auth: { type: "none" },
    createdAt: now,
    updatedAt: now,
  };
}

// Debounced autosave of saved (non-draft) requests (SPEC §7.6, ~400 ms)
const autosaveTimers = new Map<string, ReturnType<typeof setTimeout>>();
function scheduleAutosave(req: ApiRequest) {
  const prev = autosaveTimers.get(req.id);
  if (prev) clearTimeout(prev);
  autosaveTimers.set(
    req.id,
    setTimeout(() => {
      autosaveTimers.delete(req.id);
      void db.requests.put(req);
    }, 400),
  );
}

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

interface Store {
  initialized: boolean;
  collections: Collection[];
  requests: ApiRequest[]; // saved requests (collection members)
  environments: Environment[];
  history: HistoryEntry[];
  settings: Settings;

  tabs: TabState[];
  activeTabId: string | null;
  sidebarOpen: boolean;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  saveModalOpen: boolean;
  setSaveModalOpen: (open: boolean) => void;

  isLocked: boolean;
  incorrectAttempts: number;

  init: () => Promise<void>;

  // tabs
  newTab: () => void;
  openRequest: (req: ApiRequest) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateActiveRequest: (patch: Partial<ApiRequest>) => void;
  setActiveResult: (result: SendResult | null) => void;

  // core loop
  send: () => Promise<void>;

  // collections / saved requests
  createCollection: (name: string) => Promise<Collection>;
  renameCollection: (id: string, name: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  saveActiveToCollection: (collectionId: string) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  moveRequest: (collectionId: string, fromIndex: number, toIndex: number) => Promise<void>;

  // environments
  createEnvironment: (name: string) => Promise<Environment>;
  updateEnvironment: (env: Environment) => Promise<void>;
  deleteEnvironment: (id: string) => Promise<void>;
  setActiveEnvironment: (id: string | null) => void;

  // settings / misc
  updateSettings: (patch: Partial<Settings>) => void;
  toggleSidebar: () => void;
  clearHistory: () => Promise<void>;
  /** Merge an import into the workspace — rename-on-conflict, never clobber (SPEC §7.5). */
  applyImport: (report: ImportReport) => Promise<void>;

  // PIN actions
  setCredentials: (username: string, pin: string) => Promise<void>;
  unlock: (username: string, pin: string) => Promise<boolean>;
  lock: () => void;
  clearAllAppData: () => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  initialized: false,
  collections: [],
  requests: [],
  environments: [],
  history: [],
  settings: DEFAULT_SETTINGS,

  tabs: [{ request: blankRequest(), draft: true, result: null, sending: false }],
  activeTabId: null,
  sidebarOpen: true,
  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  saveModalOpen: false,
  setSaveModalOpen: (open) => set({ saveModalOpen: open }),

  isLocked: false,
  incorrectAttempts: 0,

  init: async () => {
    const [collections, requests, environments, history, settings] = await Promise.all([
      db.collections.orderBy("updatedAt").reverse().toArray(),
      db.requests.toArray(),
      db.environments.orderBy("name").toArray(),
      db.history.orderBy("sentAt").reverse().toArray(),
      loadSettings(),
    ]);
    set((s) => ({
      collections,
      requests,
      environments,
      history,
      settings,
      isLocked: true,
      initialized: true,
      activeTabId: s.activeTabId ?? s.tabs[0]?.request.id ?? null,
    }));
  },

  newTab: () => {
    const tab: TabState = { request: blankRequest(), draft: true, result: null, sending: false };
    set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.request.id }));
  },

  openRequest: (req) => {
    const existing = get().tabs.find((t) => t.request.id === req.id);
    if (existing) {
      set({ activeTabId: req.id });
      return;
    }
    const tab: TabState = {
      request: structuredClone(req),
      draft: !req.collectionId,
      result: null,
      sending: false,
    };
    set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.request.id }));
  },

  closeTab: (id) => {
    set((s) => {
      const idx = s.tabs.findIndex((t) => t.request.id === id);
      const tabs = s.tabs.filter((t) => t.request.id !== id);
      let activeTabId = s.activeTabId;
      if (activeTabId === id) {
        activeTabId = tabs[Math.min(idx, tabs.length - 1)]?.request.id ?? null;
      }
      return { tabs, activeTabId };
    });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateActiveRequest: (patch) => {
    set((s) => {
      const tabs = s.tabs.map((t) => {
        if (t.request.id !== s.activeTabId) return t;
        const request = { ...t.request, ...patch, updatedAt: Date.now() };
        if (!t.draft) scheduleAutosave(request);
        return { ...t, request };
      });
      return { tabs };
    });
    // keep saved-requests list in sync for the sidebar
    const tab = get().tabs.find((t) => t.request.id === get().activeTabId);
    if (tab && !tab.draft) {
      set((s) => ({
        requests: s.requests.map((r) => (r.id === tab.request.id ? tab.request : r)),
      }));
    }
  },

  setActiveResult: (result) => {
    set((s) => ({
      tabs: s.tabs.map((t) => (t.request.id === s.activeTabId ? { ...t, result } : t)),
    }));
  },

  send: async () => {
    const s = get();
    const tab = s.tabs.find((t) => t.request.id === s.activeTabId);
    if (!tab || tab.sending || !tab.request.url.trim()) return;

    const env = s.environments.find((e) => e.id === s.settings.activeEnvironmentId) ?? null;
    const col = s.collections.find((c) => c.id === tab.request.collectionId);
    const vars = buildVars(env, col?.variables);
    const prepared = prepareRequest(tab.request, vars);

    const mark = (patch: Partial<TabState>) =>
      set((st) => ({
        tabs: st.tabs.map((t) => (t.request.id === tab.request.id ? { ...t, ...patch } : t)),
      }));

    mark({ sending: true, result: null });
    const result = await sendRequest(prepared, {
      timeoutMs: s.settings.requestTimeoutMs,
      maxBodyBytes: s.settings.maxResponsePreviewBytes,
      fetchFn: getFetchFn(s.settings.useProxy),
    });
    mark({ sending: false, result });

    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      request: structuredClone(tab.request),
      response: result.ok
        ? {
            status: result.status,
            statusText: result.statusText,
            durationMs: result.durationMs,
            sizeBytes: result.sizeBytes,
            headers: result.headers,
            bodyPreview: result.bodyText.slice(0, s.settings.maxResponsePreviewBytes),
          }
        : null,
      error: result.ok ? undefined : result.message,
      sentAt: Date.now(),
    };
    set((st) => ({ history: [entry, ...st.history].slice(0, 100) }));
    await pushHistory(entry);
  },

  createCollection: async (name) => {
    const now = Date.now();
    const col: Collection = {
      id: crypto.randomUUID(),
      name,
      requestIds: [],
      createdAt: now,
      updatedAt: now,
    };
    await db.collections.add(col);
    set((s) => ({ collections: [col, ...s.collections] }));
    return col;
  },

  renameCollection: async (id, name) => {
    const updatedAt = Date.now();
    await db.collections.update(id, { name, updatedAt });
    set((s) => ({
      collections: s.collections.map((c) => (c.id === id ? { ...c, name, updatedAt } : c)),
    }));
  },

  deleteCollection: async (id) => {
    const memberIds = get()
      .requests.filter((r) => r.collectionId === id)
      .map((r) => r.id);
    await db.transaction("rw", db.collections, db.requests, async () => {
      await db.collections.delete(id);
      await db.requests.bulkDelete(memberIds);
    });
    set((s) => ({
      collections: s.collections.filter((c) => c.id !== id),
      requests: s.requests.filter((r) => r.collectionId !== id),
      tabs: s.tabs.map((t) =>
        memberIds.includes(t.request.id) ? { ...t, draft: true } : t,
      ),
    }));
  },

  saveActiveToCollection: async (collectionId) => {
    const s = get();
    const tab = s.tabs.find((t) => t.request.id === s.activeTabId);
    if (!tab) return;
    const request = { ...tab.request, collectionId, updatedAt: Date.now() };
    const col = s.collections.find((c) => c.id === collectionId);
    if (!col) return;
    const requestIds = col.requestIds.includes(request.id)
      ? col.requestIds
      : [...col.requestIds, request.id];
    await db.transaction("rw", db.collections, db.requests, async () => {
      await db.requests.put(request);
      await db.collections.update(collectionId, { requestIds, updatedAt: Date.now() });
    });
    set((st) => ({
      tabs: st.tabs.map((t) =>
        t.request.id === request.id ? { ...t, request, draft: false } : t,
      ),
      requests: [...st.requests.filter((r) => r.id !== request.id), request],
      collections: st.collections.map((c) =>
        c.id === collectionId ? { ...c, requestIds } : c,
      ),
    }));
  },

  deleteRequest: async (id) => {
    const req = get().requests.find((r) => r.id === id);
    await db.transaction("rw", db.collections, db.requests, async () => {
      await db.requests.delete(id);
      if (req?.collectionId) {
        const col = await db.collections.get(req.collectionId);
        if (col) {
          await db.collections.update(col.id, {
            requestIds: col.requestIds.filter((rid) => rid !== id),
          });
        }
      }
    });
    set((s) => ({
      requests: s.requests.filter((r) => r.id !== id),
      collections: s.collections.map((c) =>
        c.id === req?.collectionId
          ? { ...c, requestIds: c.requestIds.filter((rid) => rid !== id) }
          : c,
      ),
      tabs: s.tabs.map((t) => (t.request.id === id ? { ...t, draft: true } : t)),
    }));
  },

  moveRequest: async (collectionId, fromIndex, toIndex) => {
    const col = get().collections.find((c) => c.id === collectionId);
    if (!col) return;
    const requestIds = [...col.requestIds];
    const [moved] = requestIds.splice(fromIndex, 1);
    requestIds.splice(toIndex, 0, moved);
    await db.collections.update(collectionId, { requestIds });
    set((s) => ({
      collections: s.collections.map((c) =>
        c.id === collectionId ? { ...c, requestIds } : c,
      ),
    }));
  },

  createEnvironment: async (name) => {
    const env: Environment = { id: crypto.randomUUID(), name, variables: [] };
    await db.environments.add(env);
    set((s) => ({ environments: [...s.environments, env] }));
    return env;
  },

  updateEnvironment: async (env) => {
    await db.environments.put(env);
    set((s) => ({
      environments: s.environments.map((e) => (e.id === env.id ? env : e)),
    }));
  },

  deleteEnvironment: async (id) => {
    await db.environments.delete(id);
    set((s) => ({ environments: s.environments.filter((e) => e.id !== id) }));
    if (get().settings.activeEnvironmentId === id) {
      get().updateSettings({ activeEnvironmentId: null });
    }
  },

  setActiveEnvironment: (id) => get().updateSettings({ activeEnvironmentId: id }),

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    void saveSettings(settings);
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  clearHistory: async () => {
    await db.history.clear();
    set({ history: [] });
  },

  applyImport: async (report) => {
    const s = get();
    const collections = report.collections.map((c) => ({ ...c }));
    const requests = report.requests.map((r) => ({ ...r }));
    const environments = report.environments.map((e) => ({ ...e }));

    // ID collisions → fresh ids (keeping internal references intact)
    const existingColIds = new Set(s.collections.map((c) => c.id));
    for (const col of collections) {
      if (existingColIds.has(col.id)) {
        const newId = crypto.randomUUID();
        for (const r of requests) {
          if (r.collectionId === col.id) r.collectionId = newId;
        }
        col.id = newId;
      }
    }
    const existingReqIds = new Set(s.requests.map((r) => r.id));
    for (const r of requests) {
      if (existingReqIds.has(r.id)) {
        const newId = crypto.randomUUID();
        for (const col of collections) {
          col.requestIds = col.requestIds.map((id) => (id === r.id ? newId : id));
        }
        r.id = newId;
      }
    }
    const existingEnvIds = new Set(s.environments.map((e) => e.id));
    for (const env of environments) {
      if (existingEnvIds.has(env.id)) env.id = crypto.randomUUID();
    }

    // Name collisions → rename
    const colNames = new Set(s.collections.map((c) => c.name));
    for (const col of collections) {
      while (colNames.has(col.name)) col.name = `${col.name} (imported)`;
      colNames.add(col.name);
    }
    const envNames = new Set(s.environments.map((e) => e.name));
    for (const env of environments) {
      while (envNames.has(env.name)) env.name = `${env.name} (imported)`;
      envNames.add(env.name);
    }

    await db.transaction("rw", db.collections, db.requests, db.environments, async () => {
      await db.collections.bulkAdd(collections);
      await db.requests.bulkAdd(requests);
      await db.environments.bulkAdd(environments);
    });
    set((st) => ({
      collections: [...collections, ...st.collections],
      requests: [...st.requests, ...requests],
      environments: [...st.environments, ...environments],
    }));
    if (report.settings) get().updateSettings(report.settings);
  },

  setCredentials: async (username, pin) => {
    const pinHash = await hashPin(pin);
    const settings = { ...get().settings, username: username.trim(), pinHash };
    set({ settings, isLocked: false, incorrectAttempts: 0 });
    await saveSettings(settings);
  },

  unlock: async (username, pin) => {
    const s = get();
    if (!s.settings.pinHash) return true;
    const inputHash = await hashPin(pin);
    const storedUsername = s.settings.username || "";
    if (
      username.trim().toLowerCase() === storedUsername.trim().toLowerCase() &&
      inputHash === s.settings.pinHash
    ) {
      set({ isLocked: false, incorrectAttempts: 0 });
      return true;
    } else {
      const attempts = s.incorrectAttempts + 1;
      set({ incorrectAttempts: attempts });
      if (attempts >= 5) {
        await s.clearAllAppData();
      }
      return false;
    }
  },

  lock: () => {
    if (get().settings.pinHash) {
      set({ isLocked: true });
    }
  },

  clearAllAppData: async () => {
    await db.transaction("rw", [db.collections, db.requests, db.environments, db.history, db.settings], async () => {
      await db.collections.clear();
      await db.requests.clear();
      await db.environments.clear();
      await db.history.clear();
      await db.settings.clear();
    });
    set({
      collections: [],
      requests: [],
      environments: [],
      history: [],
      settings: DEFAULT_SETTINGS,
      tabs: [{ request: blankRequest(), draft: true, result: null, sending: false }],
      activeTabId: null,
      isLocked: false,
      incorrectAttempts: 0,
    });
  },
}));

/** Active tab helper — null when no tabs open. */
export const selectActiveTab = (s: { tabs: TabState[]; activeTabId: string | null }) =>
  s.tabs.find((t) => t.request.id === s.activeTabId) ?? null;
