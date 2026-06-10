import { History } from "lucide-react";
import { EmptyState } from "../common/EmptyState";

// Filled in with replayable history in the persistence phase.
export function HistoryList() {
  return (
    <EmptyState
      icon={<History size={28} />}
      title="No requests sent yet"
      hint="Your request history will appear here"
    />
  );
}
