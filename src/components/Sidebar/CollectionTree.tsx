import { FolderClosed } from "lucide-react";
import { EmptyState } from "../common/EmptyState";

// Filled in with collection CRUD in the persistence phase.
export function CollectionTree() {
  return (
    <EmptyState
      icon={<FolderClosed size={28} />}
      title="No collections yet"
      hint="Save a request to create your first collection"
    />
  );
}
