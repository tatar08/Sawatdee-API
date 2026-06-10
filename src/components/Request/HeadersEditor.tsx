import { KeyValueTable } from "./KeyValueTable";
import { isForbiddenHeader } from "../../lib/send";
import { useStore, selectActiveTab } from "../../store/useStore";

export function HeadersEditor() {
  const tab = useStore(selectActiveTab);
  const updateActiveRequest = useStore((s) => s.updateActiveRequest);
  if (!tab) return null;

  return (
    <KeyValueTable
      rows={tab.request.headers}
      onChange={(headers) => updateActiveRequest({ headers })}
      keyPlaceholder="Header"
      valuePlaceholder="value — {{variables}} supported"
      warnKey={(key) =>
        key && isForbiddenHeader(key)
          ? `"${key}" is controlled by the browser and cannot be set from a web page — it will be ignored.`
          : null
      }
    />
  );
}
