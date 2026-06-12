import { useTranslation } from "../../lib/i18n";
import styles from "./HeadersViewer.module.css";

interface HeadersViewerProps {
  headers: Record<string, string>;
}

export function HeadersViewer({ headers }: HeadersViewerProps) {
  const t = useTranslation();
  const sorted = Object.entries(headers).sort(([a], [b]) => a.localeCompare(b));

  if (sorted.length === 0) {
    return (
      <div className={styles.empty}>
        <span>{t("headersEmpty")}</span>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {sorted.map(([key, value], i) => (
        <div
          key={key}
          className={`${styles.row} ${i % 2 === 0 ? styles.even : ""}`}
        >
          <span className={styles.key}>{key}</span>
          <span className={styles.value}>{value}</span>
        </div>
      ))}
    </div>
  );
}
