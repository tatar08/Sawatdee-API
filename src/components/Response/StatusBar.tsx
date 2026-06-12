import { useState, useCallback } from "react";
import { Copy, Check, Download } from "lucide-react";
import type { SendSuccess } from "../../lib/send";
import { formatBytes, formatDuration } from "../../lib/format";
import { Button } from "../common/Button";
import { useTranslation } from "../../lib/i18n";
import styles from "./StatusBar.module.css";

interface StatusBarProps {
  result: SendSuccess;
  requestName?: string;
}

function statusClass(status: number): string {
  if (status >= 500) return styles.err;
  if (status >= 400) return styles.warn;
  if (status >= 300) return styles.info;
  return styles.ok;
}

function extFromContentType(contentType: string): string {
  if (!contentType) return "bin";
  const ct = contentType.toLowerCase();
  if (ct.includes("json")) return "json";
  if (ct.includes("html")) return "html";
  if (ct.includes("xml")) return "xml";
  if (ct.includes("svg")) return "svg";
  if (ct.includes("text/plain")) return "txt";
  if (ct.includes("text/css")) return "css";
  if (ct.includes("javascript")) return "js";
  if (ct.includes("png")) return "png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("gif")) return "gif";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("pdf")) return "pdf";
  if (ct.includes("zip")) return "zip";
  return "bin";
}

export function StatusBar({ result, requestName }: StatusBarProps) {
  const t = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(result.bodyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [result.bodyText]);

  const handleDownload = useCallback(() => {
    const ext = extFromContentType(result.contentType);
    const filename = requestName
      ? `${requestName.replace(/[^a-z0-9_-]/gi, "_")}.${ext}`
      : `response.${ext}`;
    const url = URL.createObjectURL(result.bodyBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [result.bodyBlob, result.contentType, requestName]);

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <span className={`${styles.pill} ${statusClass(result.status)}`}>
          {result.status} {result.statusText}
        </span>
        <span className={styles.meta}>{formatDuration(result.durationMs)}</span>
        <span className={styles.meta}>{formatBytes(result.sizeBytes)}</span>
      </div>

      <div className={styles.actions}>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          title={t("statusCopyTitle")}
          className={styles.actionBtn}
        >
          {copied ? (
            <Check size={14} className={styles.iconOk} />
          ) : (
            <Copy size={14} />
          )}
          {copied ? t("statusCopiedBtn") : t("statusCopyBtn")}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleDownload}
          title={t("statusDownloadTitle")}
          className={styles.actionBtn}
        >
          <Download size={14} />
          {t("statusDownloadBtn")}
        </Button>
      </div>
    </div>
  );
}
