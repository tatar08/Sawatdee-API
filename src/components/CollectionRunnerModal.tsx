import { useState, useRef, useEffect } from "react";
import { Play, Square, FileCode, CheckCircle, XCircle, Trash2, ShieldAlert, Download } from "lucide-react";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { MethodBadge } from "./common/MethodBadge";
import { useStore } from "../store/useStore";
import { parseCSV, parseJSONData } from "../lib/runner";
import { buildVars } from "../lib/variables";
import { prepareRequest, sendRequest, getFetchFn, type SendResult } from "../lib/send";
import { useTranslation } from "../lib/i18n";
import { downloadJson, safeFilename } from "../lib/download";
import type { Collection, ApiRequest } from "../lib/types";
import styles from "./CollectionRunnerModal.module.css";

interface RunResultItem {
  iteration: number;
  reqId: string;
  name: string;
  method: string;
  url: string;
  result: SendResult;
}

export function CollectionRunnerModal({
  collection,
  onClose,
}: {
  collection: Collection | null;
  onClose: () => void;
}) {
  const requests = useStore((s) => s.requests);
  const environments = useStore((s) => s.environments);
  const settings = useStore((s) => s.settings);
  const setActiveEnvironment = useStore((s) => s.setActiveEnvironment);
  const t = useTranslation();

  const [selectedReqIds, setSelectedReqIds] = useState<string[]>(() => collection?.requestIds ?? []);

  // Sync selected requests if collection changes
  useEffect(() => {
    if (collection) {
      setSelectedReqIds(collection.requestIds);
    }
  }, [collection]);

  const [dataRows, setDataRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [iterationsInput, setIterationsInput] = useState<number>(1);
  const [delayMs, setDelayMs] = useState<number>(0);
  const [running, setRunning] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<RunResultItem[]>([]);
  const [currentStepText, setCurrentStepText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll results list to bottom as runs complete
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [results]);

  // Sync iterations when data file is loaded
  useEffect(() => {
    if (dataRows.length > 0) {
      setIterationsInput(dataRows.length);
    } else {
      setIterationsInput(1);
    }
  }, [dataRows]);

  if (!collection) return null;

  // Requests in this collection in order
  const members = collection.requestIds
    .map((id) => requests.find((r) => r.id === id))
    .filter((r): r is ApiRequest => r != null);

  const activeMembers = members.filter((m) => selectedReqIds.includes(m.id));

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      let rows: Record<string, string>[] = [];
      if (file.name.endsWith(".csv")) {
        rows = parseCSV(text);
      } else if (file.name.endsWith(".json")) {
        rows = parseJSONData(text);
      } else {
        throw new Error(t("runnerDropzoneHint"));
      }
      setDataRows(rows);
      setFileName(file.name);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error reading file");
    }
  };

  const clearDataFile = () => {
    setDataRows([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRun = async () => {
    setRunning(true);
    setStopped(false);
    setProgress(0);
    setResults([]);
    stopRef.current = false;

    // Use custom iterations input to generate data rows looping list
    const iterations = Array.from({ length: iterationsInput }).map((_, idx) => {
      if (dataRows.length > 0) {
        return dataRows[idx % dataRows.length];
      }
      return {};
    });

    const total = iterations.length * activeMembers.length;
    let index = 0;

    for (let i = 0; i < iterations.length; i++) {
      const dataRow = iterations[i];
      for (const req of activeMembers) {
        if (stopRef.current) {
          setStopped(true);
          setRunning(false);
          return;
        }

        setCurrentStepText(`${t("runnerIteration")} ${i + 1}: ${req.name}`);

        const env = environments.find((e) => e.id === settings.activeEnvironmentId);
        const resolvedVars = { ...buildVars(env, collection.variables), ...dataRow };
        const prepared = prepareRequest(req, resolvedVars);

        const result = await sendRequest(prepared, {
          timeoutMs: settings.requestTimeoutMs,
          maxBodyBytes: settings.maxResponsePreviewBytes,
          fetchFn: getFetchFn(settings.useProxy),
        });

        setResults((prev) => [
          ...prev,
          {
            iteration: i + 1,
            reqId: req.id,
            name: req.name,
            method: req.method,
            url: prepared.url,
            result,
          },
        ]);

        index++;
        setProgress(Math.round((index / total) * 100));

        // Wait custom delay duration (if defined). Otherwise yield to UI for 40ms.
        if (delayMs > 0) {
          await new Promise((r) => setTimeout(r, delayMs));
        } else {
          await new Promise((r) => setTimeout(r, 40));
        }
      }
    }

    setRunning(false);
  };

  const stopRun = () => {
    stopRef.current = true;
    setStopped(true);
    setRunning(false);
  };

  const exportResults = () => {
    const activeEnv = environments.find((e) => e.id === settings.activeEnvironmentId);
    
    // Map results and filter out non-serializable blobs
    const serializedResults = results.map((r) => {
      const { result, ...rest } = r;
      if (result.ok) {
        const { bodyBlob, ...successRest } = result;
        return {
          ...rest,
          result: successRest,
        };
      }
      return r;
    });

    const exportData = {
      collectionName: collection.name,
      exportTime: new Date().toISOString(),
      environment: activeEnv ? activeEnv.name : "No Environment",
      statistics: {
        totalRuns,
        passed: passedCount,
        failed: failedCount,
        averageDurationMs: avgTime,
      },
      results: serializedResults,
    };

    const filename = `${safeFilename(collection.name)}_run_results_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    downloadJson(exportData, filename);
  };

  // Compute stats
  const totalRuns = results.length;
  const passedCount = results.filter((r) => r.result.ok && r.result.status < 400).length;
  const failedCount = totalRuns - passedCount;
  const avgTime =
    totalRuns > 0
      ? Math.round(results.reduce((acc, r) => acc + r.result.durationMs, 0) / totalRuns)
      : 0;

  const finished = !running && results.length > 0;

  return (
    <Modal
      open={true}
      onClose={running ? () => {} : onClose}
      title={t("runnerTitle", { name: collection.name })}
      width={680}
    >
      <div className={styles.layout}>
        {!running && results.length === 0 ? (
          // Setup View
          <>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.title}>
                  {t("runnerRequestsToRun", { count: activeMembers.length })}
                </h4>
                <div className={styles.bulkActions}>
                  <button
                    type="button"
                    className={styles.bulkBtn}
                    onClick={() => setSelectedReqIds(collection.requestIds)}
                  >
                    {t("runnerSelectAll")}
                  </button>
                  <button
                    type="button"
                    className={styles.bulkBtn}
                    onClick={() => setSelectedReqIds([])}
                  >
                    {t("runnerDeselectAll")}
                  </button>
                </div>
              </div>
              <div className={styles.reqList}>
                {members.map((req, i) => {
                  const isChecked = selectedReqIds.includes(req.id);
                  return (
                    <label key={req.id} className={styles.reqItemLabel}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReqIds((prev) => [...prev, req.id]);
                          } else {
                            setSelectedReqIds((prev) => prev.filter((id) => id !== req.id));
                          }
                        }}
                      />
                      <span className={styles.reqIndex}>{i + 1}</span>
                      <MethodBadge method={req.method} size="sm" />
                      <span className={styles.reqName}>{req.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={styles.section}>
              <h4 className={styles.title}>{t("runnerDataFile")}</h4>
              {fileName ? (
                <div className={styles.fileSummary}>
                  <div>
                    <span className={styles.fileName}>{fileName}</span>
                    <span className={styles.fileMeta}>
                      {" "}
                      {t("runnerLoadedFile", { name: "", count: dataRows.length }).replace("()", "")}
                    </span>
                  </div>
                  <Button variant="ghost" onClick={clearDataFile} title={t("runnerRemove")}>
                    <Trash2 size={14} /> {t("runnerRemove")}
                  </Button>
                </div>
              ) : (
                <div
                  className={styles.dropzone}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) void handleFileUpload(f);
                  }}
                >
                  <FileCode size={28} className={styles.dropzoneIcon} />
                  <span className={styles.dropzoneText}>{t("runnerDropzoneText")}</span>
                  <span className={styles.dropzoneHint}>{t("runnerDropzoneHint")}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleFileUpload(f);
                    }}
                  />
                </div>
              )}
            </div>

            <div className={styles.section}>
              <h4 className={styles.title}>{t("runnerParamsTitle")}</h4>
              <div className={styles.runnerParamsRow}>
                <div className={styles.paramField}>
                  <label htmlFor="runner-env-input" className={styles.paramLabel}>
                    {t("runnerEnvironmentLabel")}
                  </label>
                  <select
                    id="runner-env-input"
                    className={styles.paramInput}
                    value={settings.activeEnvironmentId ?? ""}
                    onChange={(e) => setActiveEnvironment(e.target.value || null)}
                  >
                    <option value="">{t("noEnvironmentOption")}</option>
                    {environments.map((env) => (
                      <option key={env.id} value={env.id}>
                        {env.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.paramField}>
                  <label htmlFor="runner-iterations-input" className={styles.paramLabel}>
                    {t("runnerIterationsLabel")}
                  </label>
                  <input
                    id="runner-iterations-input"
                    type="number"
                    min={1}
                    className={styles.paramInput}
                    value={iterationsInput}
                    onChange={(e) => setIterationsInput(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <div className={styles.paramField}>
                  <label htmlFor="runner-delay-input" className={styles.paramLabel}>
                    {t("runnerDelayLabel")} (ms)
                  </label>
                  <input
                    id="runner-delay-input"
                    type="number"
                    min={0}
                    className={styles.paramInput}
                    value={delayMs}
                    onChange={(e) => setDelayMs(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button variant="ghost" onClick={onClose}>
                {t("runnerCloseBtn")}
              </Button>
              <Button variant="primary" disabled={activeMembers.length === 0} onClick={() => void startRun()}>
                <Play size={14} /> {t("runnerRunBtn")}
              </Button>
            </div>
          </>
        ) : (
          // Active Run & Results View
          <>
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>{t("runnerStatus")}</span>
                <span className={styles.statVal} style={{ fontSize: "14px", marginTop: "4px" }}>
                  {running
                    ? t("runnerStateRunning")
                    : stopped
                      ? t("runnerStateStopped")
                      : t("runnerStateFinished")}
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>{t("runnerPassed")}</span>
                <span className={`${styles.statVal} ${styles.pass}`}>{passedCount}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>{t("runnerFailed")}</span>
                <span className={`${styles.statVal} ${styles.fail}`}>{failedCount}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>{t("runnerAvgTime")}</span>
                <span className={styles.statVal}>{avgTime} ms</span>
              </div>
            </div>

            {(running || progress < 100) && (
              <div className={styles.section}>
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar} style={{ width: `${progress}%` }} />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: "var(--pg-text-muted)",
                  }}
                >
                  <span>{currentStepText}</span>
                  <span>{progress}%</span>
                </div>
              </div>
            )}

            <div className={styles.section}>
              <h4 className={styles.title}>{t("runnerResultsLog")}</h4>
              <div className={styles.resultsScroll} ref={scrollRef}>
                <table className={styles.resultsTable}>
                  <thead>
                    <tr>
                      <th>{t("runnerIteration")}</th>
                      <th>{t("runnerRequest")}</th>
                      <th>URL</th>
                      <th>{t("runnerResult")}</th>
                      <th>{t("runnerTime")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((res, i) => {
                      const isOk = res.result.ok && res.result.status < 400;
                      return (
                        <tr key={i}>
                          <td>
                            {t("runnerIteration")} {res.iteration}
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <MethodBadge method={res.method} size="sm" />
                              <span style={{ fontWeight: 600 }}>{res.name}</span>
                            </div>
                          </td>
                          <td
                            style={{
                              color: "var(--pg-text-muted)",
                              maxWidth: "180px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {res.url}
                          </td>
                          <td>
                            {res.result.ok ? (
                              <span
                                className={`${styles.statusBadge} ${
                                  isOk ? styles.ok : styles.error
                                }`}
                              >
                                {isOk ? (
                                  <CheckCircle size={10} style={{ marginRight: "3px" }} />
                                ) : (
                                  <ShieldAlert size={10} style={{ marginRight: "3px" }} />
                                )}
                                {res.result.status} {res.result.statusText}
                              </span>
                            ) : (
                              <span className={`${styles.statusBadge} ${styles.error}`}>
                                <XCircle size={10} style={{ marginRight: "3px" }} />
                                {res.result.kind === "timeout"
                                  ? t("runnerTimeout")
                                  : t("runnerNetworkError")}
                              </span>
                            )}
                          </td>
                          <td className={styles.timeCol}>{res.result.durationMs.toFixed(0)} ms</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.actions}>
              {running && (
                <Button variant="danger" onClick={stopRun}>
                  <Square size={14} /> {t("runnerStopBtn")}
                </Button>
              )}
              {finished && (
                <>
                  <Button variant="ghost" onClick={() => setResults([])}>
                    {t("runnerConfigureBtn")}
                  </Button>
                  <Button variant="ghost" onClick={exportResults}>
                    <Download size={14} /> {t("runnerExportBtn")}
                  </Button>
                  <Button variant="primary" onClick={onClose}>
                    {t("runnerCloseBtn")}
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
