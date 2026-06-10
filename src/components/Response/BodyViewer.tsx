import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  lazy,
  Suspense,
} from "react";
import { Search, Download, X } from "lucide-react";
import type { SendSuccess } from "../../lib/send";
import { formatBytes, tryPrettyJson } from "../../lib/format";
import { Button } from "../common/Button";
import styles from "./BodyViewer.module.css";

const CodeEditor = lazy(() => import("../Request/CodeEditor"));

interface BodyViewerProps {
  result: SendSuccess;
}

type SubMode = "pretty" | "raw" | "preview";

function extFromContentType(contentType: string): string {
  if (!contentType) return "bin";
  const ct = contentType.toLowerCase();
  if (ct.includes("json")) return "json";
  if (ct.includes("html")) return "html";
  if (ct.includes("xml")) return "xml";
  if (ct.includes("svg")) return "svg";
  if (ct.includes("text/plain")) return "txt";
  if (ct.includes("css")) return "css";
  if (ct.includes("javascript")) return "js";
  if (ct.includes("png")) return "png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("gif")) return "gif";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("pdf")) return "pdf";
  return "bin";
}

function defaultSubMode(contentType: string, bodyText: string): SubMode {
  const ct = contentType.toLowerCase();
  if (ct.includes("json") && tryPrettyJson(bodyText) !== null) return "pretty";
  if (ct.includes("xml")) return "pretty";
  return "raw";
}

function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let idx = 0;
  let matchStart = lower.indexOf(lowerQuery, idx);
  while (matchStart !== -1) {
    if (matchStart > idx) {
      parts.push(text.slice(idx, matchStart));
    }
    parts.push(
      <mark key={matchStart} className={styles.mark}>
        {text.slice(matchStart, matchStart + query.length)}
      </mark>,
    );
    idx = matchStart + query.length;
    matchStart = lower.indexOf(lowerQuery, idx);
  }
  if (idx < text.length) {
    parts.push(text.slice(idx));
  }
  return <>{parts}</>;
}

function countMatches(text: string, query: string): number {
  if (!query) return 0;
  const lower = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let count = 0;
  let idx = lower.indexOf(lowerQuery);
  while (idx !== -1) {
    count++;
    idx = lower.indexOf(lowerQuery, idx + lowerQuery.length);
  }
  return count;
}

export function BodyViewer({ result }: BodyViewerProps) {
  const { sizeBytes, bodyTruncated, bodyText, contentType, bodyBlob } = result;

  // --- All hooks must be unconditional ---
  const canBePretty =
    contentType.toLowerCase().includes("json") &&
    tryPrettyJson(bodyText) !== null;
  const canBeXmlPretty = contentType.toLowerCase().includes("xml");

  const [subMode, setSubMode] = useState<SubMode>(() =>
    defaultSubMode(contentType, bodyText),
  );
  const [search, setSearch] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const prettyText = useMemo(
    () => (canBePretty ? tryPrettyJson(bodyText) : canBeXmlPretty ? bodyText : null),
    [bodyText, canBePretty, canBeXmlPretty],
  );

  const displayText = subMode === "pretty" && prettyText != null ? prettyText : bodyText;
  const matchCount = useMemo(
    () => countMatches(displayText, search),
    [displayText, search],
  );

  // Image blob URL for preview
  useEffect(() => {
    if (bodyTruncated) return;
    const isImage = contentType.toLowerCase().startsWith("image/");
    if (subMode === "preview" && isImage) {
      const url = URL.createObjectURL(bodyBlob);
      setImgUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setImgUrl(null);
      };
    }
    setImgUrl(null);
    return undefined;
  }, [subMode, bodyBlob, contentType, bodyTruncated]);

  // Escape key clears search
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") setSearch("");
    },
    [],
  );

  const handleDownload = useCallback(() => {
    const ext = extFromContentType(contentType);
    const url = URL.createObjectURL(bodyBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [bodyBlob, contentType]);

  // --- Early return for truncated large body ---
  if (bodyTruncated) {
    return (
      <div className={styles.truncatedCard}>
        <p className={styles.truncatedMsg}>
          Response too large to preview ({formatBytes(sizeBytes)})
        </p>
        <Button size="sm" variant="ghost" onClick={handleDownload}>
          <Download size={14} />
          Download
        </Button>
      </div>
    );
  }

  const isImage = contentType.toLowerCase().startsWith("image/");
  const isHtml = contentType.toLowerCase().includes("html");
  const showSearch = subMode === "pretty" || subMode === "raw";
  const prettyLang = canBePretty ? "json" : undefined;

  return (
    <div className={styles.root}>
      {/* Sub-mode pills + search */}
      <div className={styles.toolbar}>
        <div className={styles.pills}>
          <button
            className={`${styles.pill} ${subMode === "pretty" ? styles.pillActive : ""}`}
            onClick={() => setSubMode("pretty")}
          >
            Pretty
          </button>
          <button
            className={`${styles.pill} ${subMode === "raw" ? styles.pillActive : ""}`}
            onClick={() => setSubMode("raw")}
          >
            Raw
          </button>
          <button
            className={`${styles.pill} ${subMode === "preview" ? styles.pillActive : ""}`}
            onClick={() => setSubMode("preview")}
          >
            Preview
          </button>
        </div>

        {showSearch && (
          <div className={styles.searchWrap}>
            <Search size={13} className={styles.searchIcon} />
            <input
              ref={searchRef}
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search…"
              aria-label="Search in body"
            />
            {search && (
              <>
                <span className={styles.matchCount}>
                  {matchCount} {matchCount === 1 ? "match" : "matches"}
                </span>
                <button
                  className={styles.clearBtn}
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className={styles.content}>
        {subMode === "raw" && (
          <pre className={styles.raw}>
            {search
              ? highlightMatches(bodyText, search)
              : bodyText}
          </pre>
        )}

        {subMode === "pretty" && (
          <>
            {prettyText != null ? (
              <Suspense
                fallback={
                  <pre className={styles.raw}>{prettyText}</pre>
                }
              >
                <CodeEditor
                  value={prettyText}
                  lang={prettyLang}
                  readOnly
                />
              </Suspense>
            ) : (
              <pre className={styles.raw}>{bodyText}</pre>
            )}
            {search && (
              <div className={styles.prettyMatchBanner}>
                {matchCount} {matchCount === 1 ? "match" : "matches"} for &quot;{search}&quot;
              </div>
            )}
          </>
        )}

        {subMode === "preview" && (
          <>
            {isImage && imgUrl ? (
              <div className={styles.imgWrap}>
                <img src={imgUrl} alt="Response preview" className={styles.img} />
              </div>
            ) : isHtml ? (
              <iframe
                sandbox=""
                srcDoc={bodyText}
                className={styles.iframe}
                title="Response HTML preview"
              />
            ) : (
              <div className={styles.noPreview}>
                No preview for this content type
                {contentType && (
                  <code className={styles.ct}>{contentType}</code>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
