import { useState } from "react";
import { FolderClosed, History } from "lucide-react";
import { GlassPanel } from "../common/GlassPanel";
import { CollectionTree } from "./CollectionTree";
import { HistoryList } from "./HistoryList";
import styles from "./Sidebar.module.css";

type Section = "collections" | "history";

export function Sidebar() {
  const [section, setSection] = useState<Section>("collections");

  return (
    <GlassPanel className={styles.sidebar}>
      <div className={styles.tabs} role="tablist" aria-label="Sidebar sections">
        <button
          role="tab"
          aria-selected={section === "collections"}
          className={`${styles.tab} ${section === "collections" ? styles.active : ""}`}
          onClick={() => setSection("collections")}
        >
          <FolderClosed size={14} /> Collections
        </button>
        <button
          role="tab"
          aria-selected={section === "history"}
          className={`${styles.tab} ${section === "history" ? styles.active : ""}`}
          onClick={() => setSection("history")}
        >
          <History size={14} /> History
        </button>
      </div>
      <div className={styles.content}>
        {section === "collections" ? <CollectionTree /> : <HistoryList />}
      </div>
    </GlassPanel>
  );
}
