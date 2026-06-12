import { Plus, X } from "lucide-react";
import { MethodBadge } from "../common/MethodBadge";
import { useStore } from "../../store/useStore";
import { useTranslation } from "../../lib/i18n";
import styles from "./TabStrip.module.css";

export function TabStrip() {
  const t = useTranslation();
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const closeTab = useStore((s) => s.closeTab);
  const newTab = useStore((s) => s.newTab);

  return (
    <div className={styles.strip} role="tablist" aria-label="Open requests">
      {tabs.map((tabItem) => {
        const id = tabItem.request.id;
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
            <MethodBadge method={tabItem.request.method} size="sm" />
            <span className={styles.name}>{tabItem.request.name}</span>
            {tabItem.draft && <span className={styles.dot} title={t("tabUnsaved")} />}
            <button
              className={styles.close}
              aria-label={t("tabCloseRequest", { name: tabItem.request.name })}
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
      <button
        className={styles.add}
        onClick={newTab}
        aria-label={t("tabNewRequest")}
        title={t("tabNewRequestTitle")}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
