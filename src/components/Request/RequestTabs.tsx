import { useState } from "react";
import { GlassPanel } from "../common/GlassPanel";
import { ParamsEditor } from "./ParamsEditor";
import { HeadersEditor } from "./HeadersEditor";
import { BodyEditor } from "./BodyEditor";
import { AuthEditor } from "./AuthEditor";
import { useStore, selectActiveTab } from "../../store/useStore";
import styles from "./RequestTabs.module.css";

type EditorTab = "params" | "headers" | "body" | "auth";

export function RequestTabs() {
  const [active, setActive] = useState<EditorTab>("params");
  const tab = useStore(selectActiveTab);
  if (!tab) return null;

  const { request } = tab;
  const counts: Record<EditorTab, number> = {
    params: request.params.filter((p) => p.enabled && p.key).length,
    headers: request.headers.filter((h) => h.enabled && h.key).length,
    body: request.body.mode !== "none" ? 1 : 0,
    auth: request.auth.type !== "none" ? 1 : 0,
  };

  const tabs: { id: EditorTab; label: string }[] = [
    { id: "params", label: "Params" },
    { id: "headers", label: "Headers" },
    { id: "body", label: "Body" },
    { id: "auth", label: "Auth" },
  ];

  return (
    <GlassPanel className={styles.panel}>
      <div className={styles.tabRow} role="tablist" aria-label="Request sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={`${styles.tabBtn} ${active === t.id ? styles.active : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
            {counts[t.id] > 0 && <span className={styles.count}>{counts[t.id]}</span>}
          </button>
        ))}
      </div>
      <div className={styles.editorArea}>
        {active === "params" && <ParamsEditor />}
        {active === "headers" && <HeadersEditor />}
        {active === "body" && <BodyEditor />}
        {active === "auth" && <AuthEditor />}
      </div>
    </GlassPanel>
  );
}
