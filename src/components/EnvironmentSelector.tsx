import { useStore } from "../store/useStore";
import styles from "./EnvironmentSelector.module.css";

export function EnvironmentSelector() {
  const environments = useStore((s) => s.environments);
  const activeId = useStore((s) => s.settings.activeEnvironmentId);
  const setActive = useStore((s) => s.setActiveEnvironment);

  return (
    <select
      className={styles.select}
      value={activeId ?? ""}
      onChange={(e) => setActive(e.target.value || null)}
      aria-label="Active environment"
    >
      <option value="">No environment</option>
      {environments.map((env) => (
        <option key={env.id} value={env.id}>
          {env.name}
        </option>
      ))}
    </select>
  );
}
