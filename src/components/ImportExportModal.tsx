import { useRef, useState } from "react";
import { Download, FileUp, Package } from "lucide-react";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { toast } from "./common/Toast";
import { useStore } from "../store/useStore";
import { useTranslation } from "../lib/i18n";
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
  const t = useTranslation();
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
      toast(err instanceof Error ? err.message : t("importFileError"), "error");
    }
  };

  const confirmImport = async () => {
    if (!pending) return;
    await applyImport(pending.report);
    const { collections: c, requests: r, environments: e } = pending.report;
    toast(
      t("importSuccessMsg", { collections: c.length, requests: r.length, environments: e.length }),
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
    <Modal open={open} onClose={onClose} title={t("importExportTitle")} width={620}>
      {pending ? (
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>{t("importSummaryTitle", { name: pending.filename })}</h3>
          <p className={styles.summaryCounts}>
            {t("importSummaryCounts", {
              collections: pending.report.collections.length,
              requests: pending.report.requests.length,
              environments: pending.report.environments.length,
              settings: pending.report.settings ? ` · ${t("settings").toLowerCase()}` : "",
            })}
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
                <li key={i}>{t("importSkipped", { text: w })}</li>
              ))}
            </ul>
          )}
          <p className={styles.note}>
            {t("importNote")}
          </p>
          <div className={styles.summaryActions}>
            <Button variant="ghost" onClick={() => setPending(null)}>
              {t("cancelBtn")}
            </Button>
            <Button variant="primary" onClick={() => void confirmImport()}>
              {t("importBtn")}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.layout}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FileUp size={14} /> {t("importSectionTitle")}
            </h3>
            <p className={styles.note}>
              {t("importSectionNote")}
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
              <FileUp size={14} /> {t("chooseJsonFile")}
            </Button>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Download size={14} /> {t("exportSectionTitle")}
            </h3>
            {collections.length === 0 && environments.length === 0 && (
              <p className={styles.note}>{t("nothingToExport")}</p>
            )}
            {collections.map((col) => (
              <div key={col.id} className={styles.row}>
                <span className={styles.rowName}>{col.name}</span>
                <span className={styles.rowMeta}>{t("reqMetaText", { count: col.requestIds.length })}</span>
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
                  {t("postmanCollectionBtn")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    downloadJson(
                      exportNative([col], reqsOf(col.id, col.requestIds), []),
                      `${safeFilename(col.name)}.Sawatdee API.json`,
                    )
                  }
                >
                  {t("nativeCollectionBtn")}
                </Button>
              </div>
            ))}
            {environments.map((env) => (
              <div key={env.id} className={styles.row}>
                <span className={styles.rowName}>{env.name}</span>
                <span className={styles.rowMeta}>{t("defaultEnvName").toLowerCase()}</span>
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
                  {t("postmanEnvBtn")}
                </Button>
              </div>
            ))}
            {(collections.length > 0 || environments.length > 0) && (
              <Button
                variant="ghost"
                onClick={() =>
                  downloadJson(
                    exportNative(collections, requests, environments, settings),
                    "Sawatdee API-backup.json",
                  )
                }
              >
                <Package size={14} /> {t("exportAllBtn")}
              </Button>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
