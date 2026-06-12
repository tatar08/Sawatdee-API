import { ExternalLink } from "lucide-react";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { useStore } from "../store/useStore";
import { useTranslation } from "../lib/i18n";
import styles from "./UserManualModal.module.css";

interface UserManualModalProps {
  open: boolean;
  onClose: () => void;
}

export function UserManualModal({ open, onClose }: UserManualModalProps) {
  const t = useTranslation();
  const language = useStore((s) => s.settings.language ?? "en");
  const themeMode = useStore((s) => s.settings.themeMode ?? "light");

  const manualUrl = `/manual_${language}.html?theme=${themeMode}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("userManual")}
      width={1000}
      footer={
        <div className={styles.footerRow}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(manualUrl, "_blank")}
            title={t("openInNewTab")}
            aria-label={t("openInNewTab")}
            className={styles.externalBtn}
          >
            <ExternalLink size={14} />
            {t("openInNewTab")}
          </Button>
          <Button variant="primary" onClick={onClose}>
            {t("runnerCloseBtn")}
          </Button>
        </div>
      }
    >
      <div className={styles.container}>
        <iframe
          src={manualUrl}
          title={t("userManual")}
          className={styles.iframe}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </Modal>
  );
}
