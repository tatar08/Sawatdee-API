import type { Auth, AuthType } from "../../lib/types";
import { buildAuthInjection } from "../../lib/auth";
import { useStore, selectActiveTab } from "../../store/useStore";
import { useTranslation } from "../../lib/i18n";
import styles from "./AuthEditor.module.css";

export function AuthEditor() {
  const t = useTranslation();
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

  const authTypes = [
    { value: "none" as AuthType, label: t("authTypesNone") },
    { value: "bearer" as AuthType, label: t("authTypesBearer") },
    { value: "basic" as AuthType, label: t("authTypesBasic") },
    { value: "api-key" as AuthType, label: t("authTypesApiKey") },
  ];

  return (
    <div className={styles.wrap}>
      <label className={styles.field}>
        <span className={styles.label}>{t("authTypeLabel")}</span>
        <select
          className={styles.select}
          value={auth.type}
          onChange={(e) => setAuth({ type: e.target.value as AuthType })}
        >
          {authTypes.map((tOpt) => (
            <option key={tOpt.value} value={tOpt.value}>
              {tOpt.label}
            </option>
          ))}
        </select>
      </label>

      {auth.type === "bearer" && (
        <label className={styles.field}>
          <span className={styles.label}>{t("authTokenLabel")}</span>
          <input
            className={styles.input}
            value={auth.bearerToken ?? ""}
            onChange={(e) => setAuth({ bearerToken: e.target.value })}
            placeholder={t("authTokenPlaceholder")}
            spellCheck={false}
            autoComplete="off"
          />
        </label>
      )}

      {auth.type === "basic" && (
        <>
          <label className={styles.field}>
            <span className={styles.label}>{t("authUsernameLabel")}</span>
            <input
              className={styles.input}
              value={auth.basicUser ?? ""}
              onChange={(e) => setAuth({ basicUser: e.target.value })}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{t("authPasswordLabel")}</span>
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
            <span className={styles.label}>{t("authKeyNameLabel")}</span>
            <input
              className={styles.input}
              value={auth.apiKeyName ?? ""}
              onChange={(e) => setAuth({ apiKeyName: e.target.value })}
              placeholder={t("authKeyNamePlaceholder")}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{t("authValueLabel")}</span>
            <input
              className={styles.input}
              value={auth.apiKeyValue ?? ""}
              onChange={(e) => setAuth({ apiKeyValue: e.target.value })}
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{t("authAddToLabel")}</span>
            <select
              className={styles.select}
              value={auth.apiKeyIn ?? "header"}
              onChange={(e) => setAuth({ apiKeyIn: e.target.value as "header" | "query" })}
            >
              <option value="header">{t("authAddToHeader")}</option>
              <option value="query">{t("authAddToQuery")}</option>
            </select>
          </label>
        </>
      )}

      {/* Read-only preview of what auth will inject (SPEC §7.3) */}
      {(Object.keys(injection.headers).length > 0 ||
        Object.keys(injection.query).length > 0) && (
        <div className={styles.preview}>
          <span className={styles.previewTitle}>{t("authWillBeAdded")}</span>
          {Object.entries(injection.headers).map(([k, v]) => (
            <code key={k} className={styles.previewRow}>
              {k}: {v}
              {userHeaderNames.has(k.toLowerCase()) && (
                <span className={styles.overridden}>{t("authOverridden")}</span>
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
