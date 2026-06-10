import type { Environment, KeyValue } from "./types";

const VAR_RE = /\{\{\s*([^{}\s]+)\s*\}\}/g;

/** Replace every {{var}} found in vars; unknown variables are left as-is. */
export function resolve(template: string, vars: Record<string, string>): string {
  return template.replace(VAR_RE, (match, name: string) =>
    name in vars ? vars[name] : match,
  );
}

/** Unique variable names referenced in template but missing from vars. */
export function findUnresolved(template: string, vars: Record<string, string>): string[] {
  const missing = new Set<string>();
  for (const m of template.matchAll(VAR_RE)) {
    if (!(m[1] in vars)) missing.add(m[1]);
  }
  return [...missing];
}

/**
 * Build the resolution map: environment variables, overlaid on collection
 * variables (environment wins — SPEC §7.1).
 */
export function buildVars(
  env: Environment | null | undefined,
  collectionVars?: KeyValue[],
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const v of collectionVars ?? []) {
    if (v.enabled && v.key) vars[v.key] = v.value;
  }
  for (const v of env?.variables ?? []) {
    if (v.enabled && v.key) vars[v.key] = v.value;
  }
  return vars;
}
