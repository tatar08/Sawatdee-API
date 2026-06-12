import { useState } from "react";
import { GlassPanel } from "../common/GlassPanel";
import { ParamsEditor } from "./ParamsEditor";
import { HeadersEditor } from "./HeadersEditor";
import { BodyEditor } from "./BodyEditor";
import { AuthEditor } from "./AuthEditor";
import { useStore, selectActiveTab } from "../../store/useStore";
import { useTranslation } from "../../lib/i18n";
import styles from "./RequestTabs.module.css";

type EditorTab = "params" | "headers" | "body" | "auth";

export function RequestTabs() {
  const t = useTranslation();
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
    { id: "params", label: t("params") },
    { id: "headers", label: t("headers") },
    { id: "body", label: t("body") },
    { id: "auth", label: t("auth") },
  ];

  return (
    <GlassPanel className={styles.panel}>
      <div className={styles.tabRow} role="tablist" aria-label="Request sections">
        {tabs.map((tItem) => (
          <button
            key={tItem.id}
            role="tab"
            aria-selected={active === tItem.id}
            className={`${styles.tabBtn} ${active === tItem.id ? styles.active : ""}`}
            onClick={() => setActive(tItem.id)}
          >
            {tItem.label}
            {counts[tItem.id] > 0 && <span className={styles.count}>{counts[tItem.id]}</span>}
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
