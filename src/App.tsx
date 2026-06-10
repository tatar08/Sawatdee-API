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
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import styles from "./App.module.css";

export default function App() {
  const init = useStore((s) => s.init);
  useKeyboardShortcuts();
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const reduceTransparency = useStore((s) => s.settings.reduceTransparency);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    document.documentElement.toggleAttribute(
      "data-reduce-transparency",
      reduceTransparency,
    );
  }, [reduceTransparency]);

  return (
    <div className={styles.app}>
      <TopBar />
      <div className={styles.main}>
        {sidebarOpen && <Sidebar />}
        <div className={styles.workspace}>
          <TabStrip />
          <RequestBar />
          <RequestTabs />
          <ResponsePanel />
        </div>
      </div>
      <footer className={styles.footer}>
        Runs 100% in your browser — no backend, no accounts, no data ever leaves your device.&nbsp;
        Built entirely by <a href="https://www.anthropic.com/claude" target="_blank" rel="noopener noreferrer">Claude Fable 5</a> in one run.&nbsp;
        Hosted free on <a href="https://azure.microsoft.com/en-us/products/app-service/static" target="_blank" rel="noopener noreferrer">Azure Static Web Apps</a>.
      </footer>
      <SettingsModal />
      <ToastHost />
    </div>
  );
}
