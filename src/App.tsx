import { useEffect } from "react";
import { useStore } from "./store/useStore";
import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { TabStrip } from "./components/Request/TabStrip";
import { RequestBar } from "./components/Request/RequestBar";
import { RequestTabs } from "./components/Request/RequestTabs";
import { ResponsePanel } from "./components/Response/ResponsePanel";
import { ToastHost } from "./components/common/Toast";
import { SettingsModal } from "./components/SettingsModal";
import { BackgroundDecor } from "./components/common/BackgroundDecor";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { PinLockScreen } from "./components/PinLockScreen";
import styles from "./App.module.css";

export default function App() {
  const init = useStore((s) => s.init);
  useKeyboardShortcuts();
  const initialized = useStore((s) => s.initialized);
  const isLocked = useStore((s) => s.isLocked);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const reduceTransparency = useStore((s) => s.settings.reduceTransparency);
  const themePattern = useStore((s) => s.settings.themePattern ?? "none");
  const themeMode = useStore((s) => s.settings.themeMode ?? "light");
  const lock = useStore((s) => s.lock);
  const pinHash = useStore((s) => s.settings.pinHash);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    document.documentElement.toggleAttribute(
      "data-reduce-transparency",
      reduceTransparency,
    );
  }, [reduceTransparency]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme-pattern", themePattern);
  }, [themePattern]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (isLocked || !pinHash) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lock();
      }, 15 * 60 * 1000); // 15 minutes of inactivity
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];

    // Initialize timer
    resetTimer();

    // Bind event listeners
    events.forEach((evt) => {
      window.addEventListener(evt, resetTimer);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((evt) => {
        window.removeEventListener(evt, resetTimer);
      });
    };
  }, [isLocked, pinHash, lock]);

  if (!initialized) {
    return (
      <div className={styles.app} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--pg-text-strong)" }}>
        <BackgroundDecor />
        <div style={{ fontSize: "18px", fontWeight: 600 }}>Loading workspace...</div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className={styles.app}>
        <BackgroundDecor />
        <PinLockScreen />
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <BackgroundDecor />
      <TopBar />
      <div className={styles.main}>
        <div className={sidebarOpen ? styles.sidebarWrap : styles.sidebarWrapClosed}>
          <Sidebar />
        </div>
        <div className={styles.workspace}>
          <TabStrip />
          <RequestBar />
          <RequestTabs />
          <ResponsePanel />
        </div>
      </div>
      <SettingsModal />
      <ToastHost />
    </div>
  );
}
