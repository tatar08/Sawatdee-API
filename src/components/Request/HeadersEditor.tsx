import { KeyValueTable } from "./KeyValueTable";
import { isForbiddenHeader } from "../../lib/send";
import { useStore, selectActiveTab } from "../../store/useStore";
import { useTranslation } from "../../lib/i18n";

export function HeadersEditor() {
  const t = useTranslation();
  const tab = useStore(selectActiveTab);
  const updateActiveRequest = useStore((s) => s.updateActiveRequest);
  if (!tab) return null;

  return (
    <KeyValueTable
      rows={tab.request.headers}
      onChange={(headers) => updateActiveRequest({ headers })}
      keyPlaceholder={t("headers")}
      valuePlaceholder={t("bodyValuePlaceholder")}
      warnKey={(key) =>
        key && isForbiddenHeader(key)
          ? t("headerForbiddenWarning", { key })
          : null
      }
    />
  );
}
