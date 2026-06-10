import { GlassPanel } from "../common/GlassPanel";
import { EmptyState } from "../common/EmptyState";
import { useStore, selectActiveTab } from "../../store/useStore";
import styles from "./RequestTabs.module.css";

// Params | Headers | Body | Auth editors land here in the editors phase.
export function RequestTabs() {
  const tab = useStore(selectActiveTab);
  if (!tab) return null;

  return (
    <GlassPanel className={styles.panel}>
      <EmptyState title="Request editors" hint="Params · Headers · Body · Auth — coming next" />
    </GlassPanel>
  );
}
