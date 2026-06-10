import { useEffect } from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";
import styles from "./Toast.module.css";

export type ToastKind = "info" | "success" | "error";

interface ToastItem {
  id: string;
  message: string;
  kind: ToastKind;
}

interface ToastState {
  items: ToastItem[];
  add: (message: string, kind: ToastKind) => void;
  remove: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
  items: [],
  add: (message, kind) => {
    const id = crypto.randomUUID();
    set((s) => ({ items: [...s.items, { id, message, kind }] }));
  },
  remove: (id) => {
    set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
  },
}));

export function toast(message: string, kind: ToastKind = "info"): void {
  useToastStore.getState().add(message, kind);
}

function ToastPill({ item }: { item: ToastItem }) {
  const remove = useToastStore((s) => s.remove);

  useEffect(() => {
    const timer = setTimeout(() => remove(item.id), 4000);
    return () => clearTimeout(timer);
  }, [item.id, remove]);

  return (
    <div
      className={[styles.pill, styles[item.kind]].join(" ")}
      onClick={() => remove(item.id)}
      role="status"
    >
      <span className={styles.dot} />
      <span className={styles.message}>{item.message}</span>
    </div>
  );
}

export function ToastHost(): JSX.Element {
  const items = useToastStore((s) => s.items);

  return createPortal(
    <div className={styles.host} aria-live="polite" aria-atomic="false">
      {items.map((item) => (
        <ToastPill key={item.id} item={item} />
      ))}
    </div>,
    document.body
  );
}
