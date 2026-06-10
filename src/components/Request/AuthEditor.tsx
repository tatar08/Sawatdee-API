import type { Auth, AuthType } from "../../lib/types";
import { buildAuthInjection } from "../../lib/auth";
import { useStore, selectActiveTab } from "../../store/useStore";
import styles from "./AuthEditor.module.css";

const TYPES: { value: AuthType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "bearer", label: "Bearer token" },
  { value: "basic", label: "Basic auth" },
  { value: "api-key", label: "API key" },
];

export function AuthEditor() {
  const tab = useStore(selectActiveTab);
  const updateActiveRequest = useStore((s) => s.updateActiveRequest);
  if (!tab) return null;

  const auth = tab.request.auth;
  const setAuth = (patch: Partial<Auth>) =>
    updateActiveRequest({ auth: { ...auth, ...patch } });

  const injection = buildAuthInjection(auth);
  const userHeaderNames = new Set(
    tab.request.headers.filter((h) => h.enabled && h.key).map((h) => h.key.toLowerCase()),
  );

  return (
    <div className={styles.wrap}>
      <label className={styles.field}>
        <span className={styles.label}>Type</span>
        <select
          className={styles.select}
          value={auth.type}
          onChange={(e) => setAuth({ type: e.target.value as AuthType })}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      {auth.type === "bearer" && (
        <label className={styles.field}>
          <span className={styles.label}>Token</span>
          <input
            className={styles.input}
            value={auth.bearerToken ?? ""}
            onChange={(e) => setAuth({ bearerToken: e.target.value })}
            placeholder="token — {{variables}} supported"
            spellCheck={false}
            autoComplete="off"
          />
        </label>
      )}

      {auth.type === "basic" && (
        <>
          <label className={styles.field}>
            <span className={styles.label}>Username</span>
            <input
              className={styles.input}
              value={auth.basicUser ?? ""}
              onChange={(e) => setAuth({ basicUser: e.target.value })}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <input
              className={styles.input}
              value={auth.basicPass ?? ""}
              onChange={(e) => setAuth({ basicPass: e.target.value })}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
        </>
      )}

      {auth.type === "api-key" && (
        <>
          <label className={styles.field}>
            <span className={styles.label}>Key name</span>
            <input
              className={styles.input}
              value={auth.apiKeyName ?? ""}
              onChange={(e) => setAuth({ apiKeyName: e.target.value })}
              placeholder="X-Api-Key"
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Value</span>
            <input
              className={styles.input}
              value={auth.apiKeyValue ?? ""}
              onChange={(e) => setAuth({ apiKeyValue: e.target.value })}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Add to</span>
            <select
              className={styles.select}
              value={auth.apiKeyIn ?? "header"}
              onChange={(e) => setAuth({ apiKeyIn: e.target.value as "header" | "query" })}
            >
              <option value="header">Header</option>
              <option value="query">Query param</option>
            </select>
          </label>
        </>
      )}

      {/* Read-only preview of what auth will inject (SPEC §7.3) */}
      {(Object.keys(injection.headers).length > 0 ||
        Object.keys(injection.query).length > 0) && (
        <div className={styles.preview}>
          <span className={styles.previewTitle}>Will be added on send</span>
          {Object.entries(injection.headers).map(([k, v]) => (
            <code key={k} className={styles.previewRow}>
              {k}: {v}
              {userHeaderNames.has(k.toLowerCase()) && (
                <span className={styles.overridden}> — overridden by your header</span>
              )}
            </code>
          ))}
          {Object.entries(injection.query).map(([k, v]) => (
            <code key={k} className={styles.previewRow}>
              ?{k}={v}
            </code>
          ))}
        </div>
      )}
    </div>
  );
}
