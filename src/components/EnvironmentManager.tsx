import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";
import { KeyValueTable } from "./Request/KeyValueTable";
import { useStore } from "../store/useStore";
import styles from "./EnvironmentManager.module.css";

export function EnvironmentManager({ open, onClose }: { open: boolean; onClose: () => void }) {
  const environments = useStore((s) => s.environments);
  const createEnvironment = useStore((s) => s.createEnvironment);
  const updateEnvironment = useStore((s) => s.updateEnvironment);
  const deleteEnvironment = useStore((s) => s.deleteEnvironment);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = environments.find((e) => e.id === selectedId) ?? environments[0] ?? null;

  const addEnv = async () => {
    const env = await createEnvironment(`Environment ${environments.length + 1}`);
    setSelectedId(env.id);
  };

  return (
    <Modal open={open} onClose={onClose} title="Environments" width={640}>
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
            <Plus size={13} /> New environment
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
                  aria-label="Environment name"
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Delete environment "${selected.name}"?`)) {
                      void deleteEnvironment(selected.id);
                      setSelectedId(null);
                    }
                  }}
                  aria-label="Delete environment"
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
                  keyPlaceholder="variable"
                  valuePlaceholder="value"
                />
              </div>
            </>
          ) : (
            <p className={styles.empty}>
              No environments yet. Create one to define <code>{"{{variables}}"}</code>.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
