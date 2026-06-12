import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { KeyValueTable } from "./Request/KeyValueTable";
import { useStore } from "../store/useStore";
import { useTranslation } from "../lib/i18n";
import styles from "./EnvironmentManager.module.css";

export function EnvironmentManager({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslation();
  const environments = useStore((s) => s.environments);
  const createEnvironment = useStore((s) => s.createEnvironment);
  const updateEnvironment = useStore((s) => s.updateEnvironment);
  const deleteEnvironment = useStore((s) => s.deleteEnvironment);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = environments.find((e) => e.id === selectedId) ?? environments[0] ?? null;

  const addEnv = async () => {
    const env = await createEnvironment(`${t("defaultEnvName")} ${environments.length + 1}`);
    setSelectedId(env.id);
  };

  const noEnvText = t("noEnvironmentsMsg", { vars: "___VARS___" });
  const [beforeNoEnv, afterNoEnv] = noEnvText.split("___VARS___");

  return (
    <Modal open={open} onClose={onClose} title={t("environmentsTitle")} width={640}>
      <div className={styles.layout}>
        <div className={styles.list}>
          {environments.map((env) => (
            <button
              key={env.id}
              className={`${styles.item} ${selected?.id === env.id ? styles.itemActive : ""}`}
              onClick={() => setSelectedId(env.id)}
            >
              {env.name}
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={() => void addEnv()}>
            <Plus size={13} /> {t("newEnvironment")}
          </Button>
        </div>
        <div className={styles.editor}>
          {selected ? (
            <>
              <div className={styles.nameRow}>
                <input
                  className={styles.nameInput}
                  value={selected.name}
                  onChange={(e) =>
                    void updateEnvironment({ ...selected, name: e.target.value })
                  }
                  aria-label={t("envNameAria")}
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(t("deleteEnvConfirm", { name: selected.name }))) {
                      void deleteEnvironment(selected.id);
                      setSelectedId(null);
                    }
                  }}
                  aria-label={t("deleteEnvAria")}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
              <div className={styles.vars}>
                <KeyValueTable
                  rows={selected.variables}
                  onChange={(variables) =>
                    void updateEnvironment({ ...selected, variables })
                  }
                  keyPlaceholder={t("variablePlaceholder")}
                  valuePlaceholder={t("valuePlaceholder")}
                />
              </div>
            </>
          ) : (
            <p className={styles.empty}>
              {beforeNoEnv}<code>{"{{variables}}"}</code>{afterNoEnv}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
