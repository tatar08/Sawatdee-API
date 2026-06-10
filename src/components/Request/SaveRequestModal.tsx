import { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { toast } from "../common/Toast";
import { useStore, selectActiveTab } from "../../store/useStore";
import styles from "./SaveRequestModal.module.css";

export function SaveRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tab = useStore(selectActiveTab);
  const collections = useStore((s) => s.collections);
  const createCollection = useStore((s) => s.createCollection);
  const saveActiveToCollection = useStore((s) => s.saveActiveToCollection);
  const updateActiveRequest = useStore((s) => s.updateActiveRequest);

  const [name, setName] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");

  if (!tab) return null;

  const effectiveName = name || tab.request.name;
  const creatingNew = collectionId === "__new__" || collections.length === 0;

  const save = async () => {
    let targetId = collectionId;
    if (creatingNew) {
      const colName = newCollectionName.trim() || "My collection";
      targetId = (await createCollection(colName)).id;
    } else if (!targetId) {
      targetId = tab.request.collectionId ?? collections[0]?.id ?? "";
    }
    if (!targetId) return;
    updateActiveRequest({ name: effectiveName.trim() || "Untitled request" });
    await saveActiveToCollection(targetId);
    toast("Request saved", "success");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Save request"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void save()}>
            Save
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>Name</span>
          <input
            className={styles.input}
            value={name || tab.request.name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Collection</span>
          {collections.length > 0 ? (
            <select
              className={styles.input}
              value={collectionId || tab.request.collectionId || collections[0].id}
              onChange={(e) => setCollectionId(e.target.value)}
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="__new__">+ New collection…</option>
            </select>
          ) : (
            <input
              className={styles.input}
              placeholder="New collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
          )}
        </label>
        {creatingNew && collections.length > 0 && (
          <label className={styles.field}>
            <span className={styles.label}>New collection</span>
            <input
              className={styles.input}
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
          </label>
        )}
      </div>
    </Modal>
  );
}
