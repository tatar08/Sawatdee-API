import { History, Trash2 } from "lucide-react";
import { MethodBadge } from "../common/MethodBadge";
import { EmptyState } from "../common/EmptyState";
import { useStore } from "../../store/useStore";
import styles from "./HistoryList.module.css";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function statusClass(status: number): string {
  if (status >= 500) return styles.err;
  if (status >= 400) return styles.warn;
  if (status >= 300) return styles.info;
  return styles.ok;
}

export function HistoryList() {
  const history = useStore((s) => s.history);
  const openRequest = useStore((s) => s.openRequest);
  const clearHistory = useStore((s) => s.clearHistory);

  if (history.length === 0) {
    return (
      <EmptyState
        icon={<History size={28} />}
        title="No requests sent yet"
        hint="Your request history will appear here"
      />
    );
  }

  return (
    <div className={styles.list}>
      <button
        className={styles.clear}
        onClick={() => {
          if (window.confirm("Clear all history?")) void clearHistory();
        }}
      >
        <Trash2 size={12} /> Clear history
      </button>
      {history.map((entry) => (
        <div
          key={entry.id}
          className={styles.row}
          role="button"
          tabIndex={0}
          title={entry.request.url}
          onClick={() =>
            // Replay opens a fresh draft snapshot — never overwrites a saved request.
            openRequest({
              ...structuredClone(entry.request),
              id: crypto.randomUUID(),
              collectionId: undefined,
            })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.click();
          }}
        >
          <div className={styles.rowTop}>
            <MethodBadge method={entry.request.method} size="sm" />
            <span className={styles.url}>{entry.request.url || "(no URL)"}</span>
          </div>
          <div className={styles.rowBottom}>
            {entry.response ? (
              <span className={`${styles.status} ${statusClass(entry.response.status)}`}>
                {entry.response.status}
              </span>
            ) : (
              <span className={`${styles.status} ${styles.err}`}>failed</span>
            )}
            <span className={styles.time}>{timeAgo(entry.sentAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
