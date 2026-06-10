import type { ReactNode } from "react";
import styles from "./GlassPanel.module.css";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
  className?: string;
  children?: ReactNode;
}

export function GlassPanel({
  strong = false,
  className,
  children,
  ...rest
}: GlassPanelProps) {
  const cls = [
    styles.panel,
    strong ? styles.strong : styles.normal,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
