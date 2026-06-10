import type { HttpMethod } from "../../lib/types";
import styles from "./MethodSelect.module.css";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export function MethodSelect({
  value,
  onChange,
}: {
  value: HttpMethod;
  onChange: (m: HttpMethod) => void;
}) {
  return (
    <select
      className={`${styles.select} ${styles[value.toLowerCase()] ?? ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value as HttpMethod)}
      aria-label="HTTP method"
    >
      {METHODS.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}
