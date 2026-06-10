import { Loader2, Zap } from "lucide-react";
import { GlassPanel } from "../common/GlassPanel";
import { EmptyState } from "../common/EmptyState";
import { useStore, selectActiveTab } from "../../store/useStore";
import { formatBytes, formatDuration } from "../../lib/format";
import styles from "./ResponsePanel.module.css";

function statusClass(status: number): string {
  if (status >= 500) return styles.err;
  if (status >= 400) return styles.warn;
  if (status >= 300) return styles.info;
  return styles.ok;
}

export function ResponsePanel() {
  const tab = useStore(selectActiveTab);
  if (!tab) return null;
  const { result, sending } = tab;

  return (
    <GlassPanel className={styles.panel}>
      {sending ? (
        <div className={styles.center}>
          <Loader2 size={22} className={styles.spinner} />
          <span className={styles.sendingLabel}>Sending…</span>
        </div>
      ) : !result ? (
        <EmptyState
          icon={<Zap size={28} />}
          title="Send a request"
          hint="The response will appear here"
        />
      ) : result.ok ? (
        <>
          <div className={styles.statusRow}>
            <span className={`${styles.pill} ${statusClass(result.status)}`}>
              {result.status} {result.statusText}
            </span>
            <span className={styles.meta}>{formatDuration(result.durationMs)}</span>
            <span className={styles.meta}>{formatBytes(result.sizeBytes)}</span>
          </div>
          <pre className={styles.body}>{result.bodyText}</pre>
        </>
      ) : (
        <div className={styles.failure}>
          <span className={`${styles.pill} ${styles.err}`}>
            {result.kind === "timeout" ? "Timed out" : "Network / CORS error"}
          </span>
          <p className={styles.failureMsg}>{result.message}</p>
        </div>
      )}
    </GlassPanel>
  );
}
