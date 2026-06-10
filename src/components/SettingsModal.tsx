import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { useStore } from "../store/useStore";
import { db } from "../lib/db";
import styles from "./SettingsModal.module.css";

export function SettingsModal() {
  const open = useStore((s) => s.settingsOpen);
  const setOpen = useStore((s) => s.setSettingsOpen);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const clearAllData = async () => {
    if (
      !window.confirm(
        "Delete ALL Postgirl data (collections, requests, environments, history, settings)? This cannot be undone.",
      )
    ) {
      return;
    }
    await db.delete();
    window.location.reload();
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Settings">
      <div className={styles.form}>
        <label className={styles.row}>
          <span className={styles.label}>Request timeout</span>
          <span className={styles.control}>
            <input
              type="number"
              className={styles.number}
              min={1}
              max={600}
              value={Math.round(settings.requestTimeoutMs / 1000)}
              onChange={(e) =>
                updateSettings({
                  requestTimeoutMs: Math.max(1, Number(e.target.value) || 30) * 1000,
                })
              }
            />
            <span className={styles.unit}>seconds</span>
          </span>
        </label>

        <label className={styles.row}>
          <span className={styles.label}>Max response preview</span>
          <span className={styles.control}>
            <input
              type="number"
              className={styles.number}
              min={1}
              max={50}
              value={Math.round(settings.maxResponsePreviewBytes / 1_000_000)}
              onChange={(e) =>
                updateSettings({
                  maxResponsePreviewBytes:
                    Math.max(1, Number(e.target.value) || 2) * 1_000_000,
                })
              }
            />
            <span className={styles.unit}>MB</span>
          </span>
        </label>

        <label className={styles.rowCheck}>
          <input
            type="checkbox"
            className={styles.check}
            checked={settings.reduceTransparency}
            onChange={(e) => updateSettings({ reduceTransparency: e.target.checked })}
          />
          <span>
            <span className={styles.label}>Reduce transparency</span>
            <span className={styles.hint}>
              Swaps frosted glass for solid surfaces (better contrast)
            </span>
          </span>
        </label>

        <div className={styles.danger}>
          <Button variant="danger" onClick={() => void clearAllData()}>
            Clear all data…
          </Button>
        </div>

        <p className={styles.about}>
          Postgirl runs entirely in your browser — requests are sent directly from this
          page and nothing is uploaded anywhere. Some APIs block cross-origin browser
          requests (CORS); that is a browser security feature, not a bug.
        </p>
      </div>
    </Modal>
  );
}
