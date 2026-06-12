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
import styles from "./App.module.css";

export default function App() {
  const init = useStore((s) => s.init);
  useKeyboardShortcuts();
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const reduceTransparency = useStore((s) => s.settings.reduceTransparency);
  const themePattern = useStore((s) => s.settings.themePattern ?? "none");
  const themeMode = useStore((s) => s.settings.themeMode ?? "light");

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
