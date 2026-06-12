import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { GlassPanel } from "../common/GlassPanel";
import { EmptyState } from "../common/EmptyState";
import { CorsExplainer } from "../common/CorsExplainer";
import { useStore, selectActiveTab } from "../../store/useStore";
import { StatusBar } from "./StatusBar";
import { BodyViewer } from "./BodyViewer";
import { HeadersViewer } from "./HeadersViewer";
import { useTranslation } from "../../lib/i18n";
import styles from "./ResponsePanel.module.css";

type ResponseTab = "body" | "headers" | "cookies";

export function ResponsePanel() {
  const t = useTranslation();
  const tab = useStore(selectActiveTab);
  const [activeTab, setActiveTab] = useState<ResponseTab>("body");

  if (!tab) return null;

  const { result, sending, request } = tab;

  if (sending) {
    return (
      <GlassPanel className={styles.panel}>
        <div className={styles.center}>
          <Loader2 size={22} className={styles.spinner} />
          <span className={styles.sendingLabel}>{t("sending")}</span>
        </div>
      </GlassPanel>
    );
  }

  if (!result) {
    return (
      <GlassPanel className={styles.panel}>
        <EmptyState
          icon={<Zap size={28} />}
          title={t("emptyResponseTitle")}
          hint={t("emptyResponseHint")}
        />
      </GlassPanel>
    );
  }

  if (!result.ok) {
    return (
      <GlassPanel className={styles.panel}>
        <div className={styles.failureWrap}>
          <CorsExplainer failure={result} url={request.url} />
        </div>
      </GlassPanel>
    );
  }

  // Success: find set-cookie headers for cookies tab
  const cookieHeaders = Object.entries(result.headers)
    .filter(([k]) => k.toLowerCase() === "set-cookie")
    .map(([, v]) => v);

  return (
    <GlassPanel className={styles.panel}>
      <StatusBar result={result} requestName={request.name} />

      {/* Response tab row */}
      <div className={styles.tabRow}>
        <button
          className={`${styles.tabBtn} ${activeTab === "body" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("body")}
        >
          {t("responseBody")}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "headers" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("headers")}
        >
          {t("responseHeaders")}
          <span className={styles.count}>
            {Object.keys(result.headers).length}
          </span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "cookies" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("cookies")}
        >
          {t("responseCookies")}
          {cookieHeaders.length > 0 && (
            <span className={styles.count}>{cookieHeaders.length}</span>
          )}
        </button>
      </div>

      {/* Content area */}
      <div className={styles.contentArea}>
        {activeTab === "body" && <BodyViewer result={result} />}

        {activeTab === "headers" && (
          <HeadersViewer headers={result.headers} />
        )}

        {activeTab === "cookies" && (
          <div className={styles.cookiesWrap}>
            {cookieHeaders.length > 0 ? (
              <ul className={styles.cookieList}>
                {cookieHeaders.map((v, i) => (
                  <li key={i} className={styles.cookieItem}>
                    <code className={styles.cookieValue}>{v}</code>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.cookieEmpty}>
                <p className={styles.cookieNote}>
                  {t("responseCookiesEmpty")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
