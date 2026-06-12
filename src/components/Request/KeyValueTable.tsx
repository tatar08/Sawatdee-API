import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import type { KeyValue } from "../../lib/types";
import { useTranslation } from "../../lib/i18n";
import styles from "./KeyValueTable.module.css";

interface Props {
  rows: KeyValue[];
  onChange: (rows: KeyValue[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  /** Return a warning message for a key (e.g. forbidden headers), or null. */
  warnKey?: (key: string) => string | null;
}

function blankRow(): KeyValue {
  return { id: crypto.randomUUID(), key: "", value: "", enabled: true };
}

export function KeyValueTable({
  rows,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  warnKey,
}: Props) {
  const t = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  // After the phantom row materializes, move focus into the real row.
  const [pendingFocus, setPendingFocus] = useState<{ id: string; field: "key" | "value" } | null>(
    null,
  );

  useEffect(() => {
    if (!pendingFocus) return;
    const el = containerRef.current?.querySelector<HTMLInputElement>(
      `input[data-row="${pendingFocus.id}"][data-field="${pendingFocus.field}"]`,
    );
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
    setPendingFocus(null);
  }, [pendingFocus]);

  const patch = (id: string, p: Partial<KeyValue>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const remove = (id: string) => onChange(rows.filter((r) => r.id !== id));

  const addFrom = (field: "key" | "value", text: string) => {
    const row = { ...blankRow(), [field]: text };
    onChange([...rows, row]);
    setPendingFocus({ id: row.id, field });
  };

  return (
    <div className={styles.table} ref={containerRef}>
      {rows.map((row) => {
        const warning = warnKey?.(row.key) ?? null;
        return (
          <div key={row.id}>
            <div className={styles.row}>
              <input
                type="checkbox"
                className={styles.check}
                checked={row.enabled}
                onChange={(e) => patch(row.id, { enabled: e.target.checked })}
                aria-label={t("kvTableRowEnabledAria")}
              />
              <input
                className={`${styles.input} ${warning ? styles.inputWarn : ""}`}
                data-row={row.id}
                data-field="key"
                value={row.key}
                placeholder={keyPlaceholder}
                onChange={(e) => patch(row.id, { key: e.target.value })}
                spellCheck={false}
                autoComplete="off"
              />
              <input
                className={styles.input}
                data-row={row.id}
                data-field="value"
                value={row.value}
                placeholder={valuePlaceholder}
                onChange={(e) => patch(row.id, { value: e.target.value })}
                spellCheck={false}
                autoComplete="off"
              />
              <button
                className={styles.delete}
                onClick={() => remove(row.id)}
                aria-label={t("kvTableDeleteRowAria")}
              >
                <Trash2 size={13} />
              </button>
            </div>
            {warning && <div className={styles.warnText}>{warning}</div>}
          </div>
        );
      })}
      {/* phantom row: typing here appends a real row */}
      <div className={`${styles.row} ${styles.phantom}`}>
        <input type="checkbox" className={styles.check} checked readOnly tabIndex={-1} aria-hidden />
        <input
          className={styles.input}
          value=""
          placeholder={keyPlaceholder}
          onChange={(e) => addFrom("key", e.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-label={t("kvTableNewKeyAria")}
        />
        <input
          className={styles.input}
          value=""
          placeholder={valuePlaceholder}
          onChange={(e) => addFrom("value", e.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-label={t("kvTableNewValueAria")}
        />
        <span className={styles.deleteSpacer} />
      </div>
    </div>
  );
}
