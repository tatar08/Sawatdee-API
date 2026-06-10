import { KeyValueTable } from "./KeyValueTable";
import { useStore, selectActiveTab } from "../../store/useStore";

export function ParamsEditor() {
  const tab = useStore(selectActiveTab);
  const updateActiveRequest = useStore((s) => s.updateActiveRequest);
  if (!tab) return null;

  return (
    <KeyValueTable
      rows={tab.request.params}
      onChange={(params) => updateActiveRequest({ params })}
      keyPlaceholder="param"
      valuePlaceholder="value — {{variables}} supported"
    />
  );
}
