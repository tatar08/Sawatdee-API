import { useState } from "react";
import { Heart, Layers, PanelLeft, Settings } from "lucide-react";
import { GlassPanel } from "./common/GlassPanel";
import { Button } from "./common/Button";
import { EnvironmentSelector } from "./EnvironmentSelector";
import { EnvironmentManager } from "./EnvironmentManager";
import { useStore } from "../store/useStore";
import styles from "./TopBar.module.css";

export function TopBar() {
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const setSettingsOpen = useStore((s) => s.setSettingsOpen);
  const [envManagerOpen, setEnvManagerOpen] = useState(false);

  return (
    <GlassPanel className={styles.bar}>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        title="Toggle sidebar (Ctrl+B)"
      >
        <PanelLeft size={16} />
      </Button>
      <div className={styles.logo}>
        <Heart size={18} className={styles.logoIcon} aria-hidden fill="currentColor" />
        <span className={styles.wordmark}>Postgirl</span>
      </div>
      <div className={styles.spacer} />
      <EnvironmentSelector />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEnvManagerOpen(true)}
        aria-label="Manage environments"
        title="Manage environments"
      >
        <Layers size={16} />
      </Button>
      <EnvironmentManager open={envManagerOpen} onClose={() => setEnvManagerOpen(false)} />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSettingsOpen(true)}
        aria-label="Settings"
        title="Settings"
      >
        <Settings size={16} />
      </Button>
    </GlassPanel>
  );
}
