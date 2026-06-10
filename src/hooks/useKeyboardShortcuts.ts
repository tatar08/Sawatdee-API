import { useEffect } from "react";
import { useStore } from "../store/useStore";

/**
 * Global keyboard shortcuts (SPEC §13).
 * Ctrl/⌘+T and Ctrl/⌘+W are handled too, but most browsers reserve them
 * for their own tabs and never deliver the event.
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const s = useStore.getState();
      switch (e.key.toLowerCase()) {
        case "enter":
          e.preventDefault();
          void s.send();
          break;
        case "s":
          e.preventDefault();
          if (s.activeTabId) s.setSaveModalOpen(true);
          break;
        case "t":
          e.preventDefault();
          s.newTab();
          break;
        case "w":
          e.preventDefault();
          if (s.activeTabId) s.closeTab(s.activeTabId);
          break;
        case "l": {
          e.preventDefault();
          document.getElementById("pg-url-input")?.focus();
          break;
        }
        case "b":
          e.preventDefault();
          s.toggleSidebar();
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
