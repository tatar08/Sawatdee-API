import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  hint?: string;
  children?: ReactNode;
}

export function EmptyState({ icon, title, hint, children }: EmptyStateProps) {
  return (
    <div className={styles.root}>
      {icon != null && <div className={styles.icon}>{icon}</div>}
      <p className={styles.title}>{title}</p>
      {hint != null && <p className={styles.hint}>{hint}</p>}
      {children != null && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
