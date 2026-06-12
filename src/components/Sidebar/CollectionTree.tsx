import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  FolderClosed,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { MethodBadge } from "../common/MethodBadge";
import { EmptyState } from "../common/EmptyState";
import { Button } from "../common/Button";
import { CollectionRunnerModal } from "../CollectionRunnerModal";
import { useTranslation } from "../../lib/i18n";
import { useStore } from "../../store/useStore";
import type { Collection } from "../../lib/types";
import styles from "./CollectionTree.module.css";

function CollectionNode({
  collection,
  onRun,
}: {
  collection: Collection;
  onRun: () => void;
}) {
  const requests = useStore((s) => s.requests);
  const openRequest = useStore((s) => s.openRequest);
  const deleteRequest = useStore((s) => s.deleteRequest);
  const deleteCollection = useStore((s) => s.deleteCollection);
  const renameCollection = useStore((s) => s.renameCollection);
  const moveRequest = useStore((s) => s.moveRequest);
  const t = useTranslation();

  const [expanded, setExpanded] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(collection.name);

  const members = collection.requestIds
    .map((id) => requests.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => r != null);

  const commitRename = () => {
    setRenaming(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== collection.name) void renameCollection(collection.id, trimmed);
    else setName(collection.name);
  };

  return (
    <div className={styles.node}>
      <div className={styles.colRow}>
        <button
          className={styles.expand}
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        {renaming ? (
          <input
            className={styles.renameInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setName(collection.name);
                setRenaming(false);
              }
            }}
            autoFocus
          />
        ) : (
          <span className={styles.colName} onDoubleClick={() => setRenaming(true)}>
            {collection.name}
          </span>
        )}
        <span className={styles.colCount}>{members.length}</span>
        <span className={styles.actions}>
          <button
            className={styles.iconBtn}
            onClick={onRun}
            aria-label={`Run ${collection.name}`}
            title="Run Collection"
          >
            <Play size={10} fill="currentColor" />
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setRenaming(true)}
            aria-label={`Rename ${collection.name}`}
            title="Rename Collection"
          >
            <Pencil size={12} />
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => {
              if (window.confirm(t("deleteCollectionConfirm", { name: collection.name, count: members.length }))) {
                void deleteCollection(collection.id);
              }
            }}
            aria-label={`Delete ${collection.name}`}
            title="Delete Collection"
          >
            <Trash2 size={12} />
          </button>
        </span>
      </div>
      {expanded &&
        members.map((req, i) => (
          <div
            key={req.id}
            className={styles.reqRow}
            role="button"
            tabIndex={0}
            onClick={() => openRequest(req)}
            onKeyDown={(e) => {
              if (e.key === "Enter") openRequest(req);
            }}
          >
            <MethodBadge method={req.method} size="sm" />
            <span className={styles.reqName} title={req.name}>
              {req.name}
            </span>
            <span className={styles.reqActions}>
              <button
                className={styles.iconBtn}
                disabled={i === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  void moveRequest(collection.id, i, i - 1);
                }}
                aria-label={`Move ${req.name} up`}
              >
                <ArrowUp size={12} />
              </button>
              <button
                className={styles.iconBtn}
                disabled={i === members.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  void moveRequest(collection.id, i, i + 1);
                }}
                aria-label={`Move ${req.name} down`}
              >
                <ArrowDown size={12} />
              </button>
              <button
                className={styles.iconBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(t("deleteRequestConfirm", { name: req.name }))) void deleteRequest(req.id);
                }}
                aria-label={`Delete ${req.name}`}
              >
                <Trash2 size={12} />
              </button>
            </span>
          </div>
        ))}
    </div>
  );
}

export function CollectionTree() {
  const collections = useStore((s) => s.collections);
  const createCollection = useStore((s) => s.createCollection);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [runnerCollection, setRunnerCollection] = useState<Collection | null>(null);
  const t = useTranslation();

  const commitAdd = () => {
    const trimmed = newName.trim();
    if (trimmed) void createCollection(trimmed);
    setNewName("");
    setAdding(false);
  };

  return (
    <div className={styles.tree}>
      {collections.length === 0 && !adding ? (
        <EmptyState
          icon={<FolderClosed size={28} />}
          title={t("noCollectionsTitle")}
          hint={t("noCollectionsHint")}
        >
          <Button variant="primary" size="sm" onClick={() => setAdding(true)}>
            <Plus size={13} /> {t("newCollection")}
          </Button>
        </EmptyState>
      ) : (
        <>
          {collections.map((c) => (
            <CollectionNode key={c.id} collection={c} onRun={() => setRunnerCollection(c)} />
          ))}
          {adding ? (
            <input
              className={styles.renameInput}
              value={newName}
              placeholder={t("collectionNamePlaceholder")}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={commitAdd}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitAdd();
                if (e.key === "Escape") {
                  setNewName("");
                  setAdding(false);
                }
              }}
              autoFocus
            />
          ) : (
            <button className={styles.addBtn} onClick={() => setAdding(true)}>
              <Plus size={13} /> {t("newCollection")}
            </button>
          )}
        </>
      )}

      {runnerCollection && (
        <CollectionRunnerModal
          collection={runnerCollection}
          onClose={() => setRunnerCollection(null)}
        />
      )}
    </div>
  );
}
