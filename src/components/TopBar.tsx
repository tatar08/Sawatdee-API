import { useState } from "react";
import { Heart, Layers, PanelLeft, Settings, Sun, Moon, BookOpen } from "lucide-react";
import { GlassPanel } from "./common/GlassPanel";
import { Button } from "./common/Button";
import { EnvironmentSelector } from "./EnvironmentSelector";
import { EnvironmentManager } from "./EnvironmentManager";
import { UserManualModal } from "./UserManualModal";
import { useStore } from "../store/useStore";
import { useTranslation } from "../lib/i18n";
import styles from "./TopBar.module.css";

export function TopBar() {
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const setSettingsOpen = useStore((s) => s.setSettingsOpen);
  const themeMode = useStore((s) => s.settings.themeMode ?? "light");
  const updateSettings = useStore((s) => s.updateSettings);
  const [envManagerOpen, setEnvManagerOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const t = useTranslation();

  const toggleTheme = () => {
    updateSettings({ themeMode: themeMode === "light" ? "dark" : "light" });
  };

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
        <span className={styles.wordmark}>Sawatdee API</span>
        <span className={styles.tagline}>
          {t("logoTagline")}
        </span>
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
        onClick={() => setManualOpen(true)}
        aria-label={t("userManual")}
        title={t("userManual")}
      >
        <BookOpen size={16} />
      </Button>
      <UserManualModal open={manualOpen} onClose={() => setManualOpen(false)} />

      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        aria-label={themeMode === "light" ? "Switch to dark mode" : "Switch to light mode"}
        title={themeMode === "light" ? "Dark Mode" : "Light Mode"}
      >
        {themeMode === "light" ? <Moon size={16} /> : <Sun size={16} />}
      </Button>
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
