import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";

// Loaded lazily (React.lazy) so CodeMirror stays out of the initial bundle.
export default function CodeEditor({
  value,
  onChange,
  lang,
  readOnly = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  lang?: string;
  readOnly?: boolean;
}) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      extensions={lang === "json" ? [json()] : []}
      height="100%"
      style={{ height: "100%", fontSize: "12.5px", fontFamily: "var(--pg-font-mono)" }}
      basicSetup={{
        foldGutter: true,
        highlightActiveLine: !readOnly,
        highlightActiveLineGutter: !readOnly,
      }}
    />
  );
}
