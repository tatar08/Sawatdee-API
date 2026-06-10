import { useMemo } from "react";
import { SendHorizonal } from "lucide-react";
import { GlassPanel } from "../common/GlassPanel";
import { Button } from "../common/Button";
import { MethodSelect } from "./MethodSelect";
import { useStore, selectActiveTab } from "../../store/useStore";
import { resolve, findUnresolved, buildVars } from "../../lib/variables";
import styles from "./RequestBar.module.css";

export function RequestBar() {
  const tab = useStore(selectActiveTab);
  const updateActiveRequest = useStore((s) => s.updateActiveRequest);
  const send = useStore((s) => s.send);
  const newTab = useStore((s) => s.newTab);
  const environments = useStore((s) => s.environments);
  const collections = useStore((s) => s.collections);
  const activeEnvId = useStore((s) => s.settings.activeEnvironmentId);

  const vars = useMemo(() => {
    const env = environments.find((e) => e.id === activeEnvId) ?? null;
    const col = collections.find((c) => c.id === tab?.request.collectionId);
    return buildVars(env, col?.variables);
  }, [environments, collections, activeEnvId, tab?.request.collectionId]);

  if (!tab) {
    return (
      <GlassPanel className={styles.bar}>
        <span className={styles.noTab}>No request open</span>
        <Button variant="primary" size="sm" onClick={newTab}>
          New request
        </Button>
      </GlassPanel>
    );
  }

  const url = tab.request.url;
  const resolved = resolve(url, vars);
  const unresolved = findUnresolved(url, vars);

  return (
    <div className={styles.wrap}>
      <GlassPanel className={styles.bar}>
        <MethodSelect
          value={tab.request.method}
          onChange={(method) => updateActiveRequest({ method })}
        />
        <input
          id="pg-url-input"
          className={styles.url}
          type="text"
          placeholder="https://api.example.com/users  —  {{variables}} supported"
          value={url}
          onChange={(e) => updateActiveRequest({ url: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
          spellCheck={false}
          autoComplete="off"
          aria-label="Request URL"
        />
        <Button
          variant="primary"
          onClick={() => void send()}
          disabled={tab.sending || !url.trim()}
          title="Send (Ctrl+Enter)"
        >
          <SendHorizonal size={15} />
          {tab.sending ? "Sending…" : "Send"}
        </Button>
      </GlassPanel>
      {(resolved !== url || unresolved.length > 0) && url.trim() && (
        <div className={styles.preview}>
          {unresolved.length > 0 ? (
            <span className={styles.unresolved}>
              Unresolved: {unresolved.map((v) => `{{${v}}}`).join(", ")}
            </span>
          ) : (
            <span className={styles.resolved} title="Resolved URL">
              → {resolved}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
