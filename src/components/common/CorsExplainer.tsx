import { CircleAlert, Check } from "lucide-react";
import type { SendFailure } from "../../lib/send";
import { useTranslation } from "../../lib/i18n";
import styles from "./CorsExplainer.module.css";

interface CorsExplainerProps {
  failure: SendFailure;
  url: string;
}

function safeOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

export function CorsExplainer({ failure, url }: CorsExplainerProps) {
  const t = useTranslation();

  const checklist = [
    { icon: "check" as const, text: t("corsChecklistCorrectUrl") },
    { icon: "check" as const, text: t("corsChecklistAllowOrigin") },
    { icon: "alert" as const, text: t("corsChecklistMixedContent") },
    { icon: "check" as const, text: t("corsChecklistDocsCors") },
  ];

  if (failure.kind === "timeout") {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <CircleAlert size={18} className={styles.iconErr} />
          <span className={styles.title}>{t("corsTimeoutTitle")}</span>
        </div>
        <p className={styles.body}>{failure.message}</p>
        <p className={styles.hint}>{t("corsTimeoutHint")}</p>
      </div>
    );
  }

  const origin = safeOrigin(url);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <CircleAlert size={18} className={styles.iconErr} />
        <span className={styles.title}>{t("corsBlockedTitle")}</span>
      </div>

      <p className={styles.body}>{t("corsBlockedBody")}</p>

      <div className={styles.originRow}>
        <span className={styles.originLabel}>{t("corsTargetOrigin")}</span>
        <code className={styles.originChip}>{origin}</code>
      </div>

      <ul className={styles.checklist}>
        {checklist.map(({ icon, text }) => (
          <li key={text} className={styles.checkItem}>
            {icon === "alert" ? (
              <CircleAlert size={13} className={styles.iconWarn} />
            ) : (
              <Check size={13} className={styles.iconMuted} />
            )}
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <p className={styles.footer}>{t("corsFooter")}</p>
    </div>
  );
}
