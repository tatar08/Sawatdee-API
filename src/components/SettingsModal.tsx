import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { useStore } from "../store/useStore";
import { useTranslation } from "../lib/i18n";
import { db } from "../lib/db";
import styles from "./SettingsModal.module.css";

export function SettingsModal() {
  const open = useStore((s) => s.settingsOpen);
  const setOpen = useStore((s) => s.setSettingsOpen);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const t = useTranslation();

  const clearAllData = async () => {
    if (!window.confirm(t("clearDataConfirm"))) {
      return;
    }
    await db.delete();
    window.location.reload();
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title={t("settings")}>
      <div className={styles.form}>
        <label className={styles.row}>
          <span className={styles.label}>{t("languageLabel")}</span>
          <span className={styles.control}>
            <select
              className={styles.select}
              value={settings.language ?? "en"}
              onChange={(e) => updateSettings({ language: e.target.value as any })}
            >
              <option value="en">English</option>
              <option value="th">ภาษาไทย</option>
            </select>
          </span>
        </label>

        <label className={styles.row}>
          <span className={styles.label}>{t("themeMode")}</span>
          <span className={styles.control}>
            <select
              className={styles.select}
              value={settings.themeMode ?? "light"}
              onChange={(e) => updateSettings({ themeMode: e.target.value as any })}
            >
              <option value="light">{t("themeLight")}</option>
              <option value="dark">{t("themeDark")}</option>
            </select>
          </span>
        </label>

        <label className={styles.row}>
          <span className={styles.label}>{t("requestTimeout")}</span>
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
            <span className={styles.unit}>{t("seconds")}</span>
          </span>
        </label>

        <label className={styles.row}>
          <span className={styles.label}>{t("maxResponsePreview")}</span>
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
            <span className={styles.unit}>{t("mb")}</span>
          </span>
        </label>

        <div className={styles.themeSection}>
          <span className={styles.label}>{t("themeWallpaper")}</span>
          <div className={styles.themeGrid}>
            {[
              { id: "none", label: t("themeClassic"), icon: "🌸", bg: "linear-gradient(135deg, #fff5f9, #fde8f1)" },
              { id: "dog", label: t("themeDog"), icon: "🐕", bg: "linear-gradient(135deg, #fffcf8, #f7ebe0)" },
              { id: "cat", label: t("themeCat"), icon: "🐈", bg: "linear-gradient(135deg, #fff2f5, #fde4eb)" },
              { id: "rabbit", label: t("themeRabbit"), icon: "🐇", bg: "linear-gradient(135deg, #f5f4fd, #e9e6fd)" },
              { id: "panda", label: t("themePanda"), icon: "🐼", bg: "linear-gradient(135deg, #f4faf4, #e7f2e8)" },
              { id: "elephant", label: t("themeElephant"), icon: "🐘", bg: "linear-gradient(135deg, #f1fafb, #e0f2f5)" },
              { id: "kitsune", label: t("themeKitsune"), icon: "🦊", bg: "linear-gradient(135deg, #fef4ec, #fce2cc)" },
              { id: "dragon", label: t("themeDragon"), icon: "🐉", bg: "linear-gradient(135deg, #fef7e7, #f8e8c0)" },
              { id: "deer", label: t("themeDeer"), icon: "🦌", bg: "linear-gradient(135deg, #f5f8ef, #e8eed5)" },
              { id: "koi", label: t("themeKoi"), icon: "🐠", bg: "linear-gradient(135deg, #f0f5fc, #dce8f8)" },
              { id: "owl", label: t("themeOwl"), icon: "🦉", bg: "linear-gradient(135deg, #f5efe5, #e8dac8)" },
              { id: "turtle", label: t("themeTurtle"), icon: "🐢", bg: "linear-gradient(135deg, #ebf7ee, #d0ecd6)" },
              { id: "butterfly", label: t("themeButterfly"), icon: "🦋", bg: "linear-gradient(135deg, #f8eef8, #eeddf2)" },
              { id: "crane", label: t("themeCrane"), icon: "🐦", bg: "linear-gradient(135deg, #faf5f2, #f2e7e1)" },
              { id: "naga", label: t("themeNaga"), icon: "🐍", bg: "linear-gradient(135deg, #eef9e8, #d5efca)" },
              { id: "tiger", label: t("themeTiger"), icon: "🐅", bg: "linear-gradient(135deg, #fef3e4, #fae1c0)" },
              { id: "suvarnabhumi", label: t("themeSuvarnabhumi"), icon: "🏛️", bg: "linear-gradient(135deg, #1e3159, #0f1a30)", dark: true },
              { id: "ayutthaya", label: t("themeAyutthaya"), icon: "🧱", bg: "linear-gradient(135deg, #f4f1de, #f2cc8f)" },
              { id: "bangkok", label: t("themeBangkok"), icon: "🌃", bg: "linear-gradient(135deg, #111827, #090d16)", dark: true },
              { id: "cybersiam", label: t("themeCybersiam"), icon: "⚡", bg: "linear-gradient(135deg, #0c1530, #020617)", dark: true },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`${styles.themeOption} ${
                  (settings.themePattern ?? "none") === t.id ? styles.themeActive : ""
                }`}
                style={{ background: t.bg, ...(t.dark ? { color: "#fff" } : {}) }}
                onClick={() => updateSettings({ themePattern: t.id as any })}
              >
                <span className={styles.themeIcon}>{t.icon}</span>
                <span className={styles.themeName} style={t.dark ? { color: "#fff" } : undefined}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <label className={styles.rowCheck}>
          <input
            type="checkbox"
            className={styles.check}
            checked={settings.reduceTransparency}
            onChange={(e) => updateSettings({ reduceTransparency: e.target.checked })}
          />
          <span>
            <span className={styles.label}>{t("reduceTransparency")}</span>
            <span className={styles.hint}>
              {t("reduceTransparencyHint")}
            </span>
          </span>
        </label>

        <div className={styles.danger}>
          <Button variant="danger" onClick={() => void clearAllData()}>
            {t("clearAllData")}
          </Button>
        </div>

        <p className={styles.about}>
          {t("aboutText")}
        </p>
      </div>
    </Modal>
  );
}
