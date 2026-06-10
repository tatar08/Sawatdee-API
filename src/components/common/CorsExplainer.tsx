import { CircleAlert, Check } from "lucide-react";
import type { SendFailure } from "../../lib/send";
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

const CHECKLIST: { icon: "alert" | "check"; text: string }[] = [
  { icon: "check", text: "Is the URL correct and the server up?" },
  { icon: "check", text: "Does the API send Access-Control-Allow-Origin?" },
  { icon: "alert", text: "HTTPS page cannot call HTTP APIs (mixed content)" },
  { icon: "check", text: "Try the API's docs for a CORS-enabled endpoint" },
];

export function CorsExplainer({ failure, url }: CorsExplainerProps) {
  if (failure.kind === "timeout") {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <CircleAlert size={18} className={styles.iconErr} />
          <span className={styles.title}>Request timed out</span>
        </div>
        <p className={styles.body}>{failure.message}</p>
        <p className={styles.hint}>
          You can raise the timeout limit in{" "}
          <strong>Settings → Request timeout</strong>.
        </p>
      </div>
    );
  }

  const origin = safeOrigin(url);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <CircleAlert size={18} className={styles.iconErr} />
        <span className={styles.title}>Request blocked or unreachable</span>
      </div>

      <p className={styles.body}>
        Postgirl runs entirely in your browser. A network error thrown here
        usually means the target API does not allow cross-origin browser requests
        (CORS), the host is unreachable, or the URL is invalid.
      </p>

      <div className={styles.originRow}>
        <span className={styles.originLabel}>Target origin</span>
        <code className={styles.originChip}>{origin}</code>
      </div>

      <ul className={styles.checklist}>
        {CHECKLIST.map(({ icon, text }) => (
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

      <p className={styles.footer}>
        This is a browser security feature, not a bug — Postman's desktop app
        bypasses it with a native HTTP client.
      </p>
    </div>
  );
}
