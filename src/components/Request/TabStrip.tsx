import { Plus, X } from "lucide-react";
import { MethodBadge } from "../common/MethodBadge";
import { useStore } from "../../store/useStore";
import styles from "./TabStrip.module.css";

export function TabStrip() {
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const closeTab = useStore((s) => s.closeTab);
  const newTab = useStore((s) => s.newTab);

  return (
    <div className={styles.strip} role="tablist" aria-label="Open requests">
      {tabs.map((t) => {
        const id = t.request.id;
        const active = id === activeTabId;
        return (
          <div
            key={id}
            role="tab"
            aria-selected={active}
            tabIndex={0}
            className={`glass ${styles.tab} ${active ? styles.active : ""}`}
            onClick={() => setActiveTab(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setActiveTab(id);
            }}
          >
            <MethodBadge method={t.request.method} size="sm" />
            <span className={styles.name}>{t.request.name}</span>
            {t.draft && <span className={styles.dot} title="Unsaved" />}
            <button
              className={styles.close}
              aria-label={`Close ${t.request.name}`}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(id);
              }}
            >
              <X size={11} />
            </button>
          </div>
        );
      })}
      <button className={styles.add} onClick={newTab} aria-label="New request tab" title="New request (Ctrl+T)">
        <Plus size={14} />
      </button>
    </div>
  );
}
