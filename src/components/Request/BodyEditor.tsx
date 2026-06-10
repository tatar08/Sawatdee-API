import { Suspense, lazy } from "react";
import type { BodyMode, RequestBody } from "../../lib/types";
import { KeyValueTable } from "./KeyValueTable";
import { EmptyState } from "../common/EmptyState";
import { useStore, selectActiveTab } from "../../store/useStore";
import styles from "./BodyEditor.module.css";

const CodeEditor = lazy(() => import("./CodeEditor"));

const MODES: { value: BodyMode; label: string }[] = [
  { value: "none", label: "None" },
  { value: "json", label: "JSON" },
  { value: "raw", label: "Raw" },
  { value: "form-data", label: "Form data" },
  { value: "x-www-form-urlencoded", label: "URL encoded" },
];

const RAW_LANGS = ["text", "json", "xml", "html"] as const;

export function BodyEditor() {
  const tab = useStore(selectActiveTab);
  const updateActiveRequest = useStore((s) => s.updateActiveRequest);
  if (!tab) return null;

  const body = tab.request.body;
  const setBody = (patch: Partial<RequestBody>) =>
    updateActiveRequest({ body: { ...body, ...patch } });

  return (
    <div className={styles.wrap}>
      <div className={styles.modeRow} role="radiogroup" aria-label="Body mode">
        {MODES.map((m) => (
          <button
            key={m.value}
            role="radio"
            aria-checked={body.mode === m.value}
            className={`${styles.mode} ${body.mode === m.value ? styles.modeActive : ""}`}
            onClick={() => setBody({ mode: m.value })}
          >
            {m.label}
          </button>
        ))}
        {body.mode === "raw" && (
          <select
            className={styles.langSelect}
            value={body.rawLang ?? "text"}
            onChange={(e) =>
              setBody({ rawLang: e.target.value as RequestBody["rawLang"] })
            }
            aria-label="Raw body language"
          >
            {RAW_LANGS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className={styles.editor}>
        {body.mode === "none" && (
          <EmptyState title="No body" hint="This request has no payload" />
        )}
        {(body.mode === "json" || body.mode === "raw") && (
          <Suspense fallback={<div className={styles.loading}>Loading editor…</div>}>
            <CodeEditor
              value={body.raw ?? ""}
              onChange={(raw) => setBody({ raw })}
              lang={body.mode === "json" ? "json" : body.rawLang}
            />
          </Suspense>
        )}
        {(body.mode === "form-data" || body.mode === "x-www-form-urlencoded") && (
          <KeyValueTable
            rows={body.formData ?? []}
            onChange={(formData) => setBody({ formData })}
            keyPlaceholder="field"
            valuePlaceholder="value — {{variables}} supported"
          />
        )}
      </div>
    </div>
  );
}
