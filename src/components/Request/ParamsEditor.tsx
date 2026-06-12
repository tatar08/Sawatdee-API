import { KeyValueTable } from "./KeyValueTable";
import { useStore, selectActiveTab } from "../../store/useStore";
import { useTranslation } from "../../lib/i18n";

export function ParamsEditor() {
  const t = useTranslation();
  const tab = useStore(selectActiveTab);
  const updateActiveRequest = useStore((s) => s.updateActiveRequest);
  if (!tab) return null;

  return (
    <KeyValueTable
      rows={tab.request.params}
      onChange={(params) => updateActiveRequest({ params })}
      keyPlaceholder={t("params")}
      valuePlaceholder={t("bodyValuePlaceholder")}
    />
  );
}
