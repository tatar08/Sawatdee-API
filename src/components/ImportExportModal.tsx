import { useRef, useState } from "react";
import { Download, FileUp, Package } from "lucide-react";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { toast } from "./common/Toast";
import { useStore } from "../store/useStore";
import {
  importFile,
  exportPostmanCollection,
  exportPostmanEnvironment,
  exportNative,
  type ImportReport,
} from "../lib/importExport";
import { downloadJson, safeFilename } from "../lib/download";
import styles from "./ImportExportModal.module.css";

export function ImportExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const collections = useStore((s) => s.collections);
  const requests = useStore((s) => s.requests);
  const environments = useStore((s) => s.environments);
  const settings = useStore((s) => s.settings);
  const applyImport = useStore((s) => s.applyImport);

  const fileRef = useRef<HTMLInputElement>(null);
  // Pre-import summary state: parsed report awaiting user confirmation
  const [pending, setPending] = useState<{ report: ImportReport; filename: string } | null>(
    null,
  );

  const pickFile = async (file: File) => {
    try {
      const data: unknown = JSON.parse(await file.text());
      const report = importFile(data, Date.now());
      setPending({ report, filename: file.name });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not read file", "error");
    }
  };

  const confirmImport = async () => {
    if (!pending) return;
    await applyImport(pending.report);
    const { collections: c, requests: r, environments: e } = pending.report;
    toast(
      `Imported ${c.length} collection(s), ${r.length} request(s), ${e.length} environment(s)`,
      "success",
    );
    setPending(null);
    onClose();
  };

  const reqsOf = (colId: string, ids: string[]) =>
    ids
      .map((id) => requests.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => r != null && r.collectionId === colId);

  return (
    <Modal open={open} onClose={onClose} title="Import / Export" width={620}>
      {pending ? (
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>Import “{pending.filename}”?</h3>
          <p className={styles.summaryCounts}>
            {pending.report.collections.length} collection(s) ·{" "}
            {pending.report.requests.length} request(s) ·{" "}
            {pending.report.environments.length} environment(s)
            {pending.report.settings ? " · settings" : ""}
          </p>
          {pending.report.warnings.length > 0 && (
            <ul className={styles.warnings}>
              {pending.report.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
          {pending.report.skipped.length > 0 && (
            <ul className={styles.warnings}>
              {pending.report.skipped.map((w, i) => (
                <li key={i}>Skipped: {w}</li>
              ))}
            </ul>
          )}
          <p className={styles.note}>
            Existing data is never overwritten — conflicting names are imported with a
            “(imported)” suffix.
          </p>
          <div className={styles.summaryActions}>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void confirmImport()}>
              Import
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.layout}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FileUp size={14} /> Import
            </h3>
            <p className={styles.note}>
              Postman collection v2.1, Postman environment, or Postgirl bundle — format is
              detected automatically.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void pickFile(f);
                e.target.value = "";
              }}
            />
            <Button variant="primary" onClick={() => fileRef.current?.click()}>
              <FileUp size={14} /> Choose JSON file…
            </Button>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Download size={14} /> Export
            </h3>
            {collections.length === 0 && environments.length === 0 && (
              <p className={styles.note}>Nothing to export yet.</p>
            )}
            {collections.map((col) => (
              <div key={col.id} className={styles.row}>
                <span className={styles.rowName}>{col.name}</span>
                <span className={styles.rowMeta}>{col.requestIds.length} req</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    downloadJson(
                      exportPostmanCollection(col, reqsOf(col.id, col.requestIds)),
                      `${safeFilename(col.name)}.postman_collection.json`,
                    )
                  }
                >
                  Postman v2.1
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    downloadJson(
                      exportNative([col], reqsOf(col.id, col.requestIds), []),
                      `${safeFilename(col.name)}.postgirl.json`,
                    )
                  }
                >
                  Native
                </Button>
              </div>
            ))}
            {environments.map((env) => (
              <div key={env.id} className={styles.row}>
                <span className={styles.rowName}>{env.name}</span>
                <span className={styles.rowMeta}>env</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    downloadJson(
                      exportPostmanEnvironment(env),
                      `${safeFilename(env.name)}.postman_environment.json`,
                    )
                  }
                >
                  Postman env
                </Button>
              </div>
            ))}
            {(collections.length > 0 || environments.length > 0) && (
              <Button
                variant="ghost"
                onClick={() =>
                  downloadJson(
                    exportNative(collections, requests, environments, settings),
                    "postgirl-backup.json",
                  )
                }
              >
                <Package size={14} /> Export all (Postgirl bundle)
              </Button>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
