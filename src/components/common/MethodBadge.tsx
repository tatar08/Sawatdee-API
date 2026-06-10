import styles from "./MethodBadge.module.css";

interface MethodBadgeProps {
  method: string;
  size?: "sm" | "md";
}

const METHOD_VAR_MAP: Record<string, string> = {
  GET: "--pg-method-get",
  POST: "--pg-method-post",
  PUT: "--pg-method-put",
  PATCH: "--pg-method-patch",
  DELETE: "--pg-method-delete",
};

export function MethodBadge({ method, size = "md" }: MethodBadgeProps) {
  const upper = method.toUpperCase();
  const colorVar = METHOD_VAR_MAP[upper];

  const style: React.CSSProperties = colorVar
    ? ({
        "--c": `var(${colorVar})`,
        color: `var(${colorVar})`,
        background: `color-mix(in srgb, var(${colorVar}) 14%, transparent)`,
      } as React.CSSProperties)
    : {
        color: "var(--pg-text-muted)",
        background: "color-mix(in srgb, var(--pg-text-muted) 14%, transparent)",
      };

  const cls = [styles.badge, styles[size]].join(" ");

  return (
    <span className={cls} style={style}>
      {upper}
    </span>
  );
}
