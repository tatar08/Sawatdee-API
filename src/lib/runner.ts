/**
 * Parse CSV text into a list of variable records.
 * Supports quoted fields and escaped quotes.
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (header) {
        row[header] = values[index] ?? "";
      }
    });
    rows.push(row);
  }
  return rows;
}

/**
 * Parse JSON data file containing variables.
 * Expects an array of objects, or a single object.
 */
export function parseJSONData(text: string): Record<string, string>[] {
  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) {
    return parsed.map((item: any) => {
      const row: Record<string, string> = {};
      if (item && typeof item === "object") {
        for (const [k, v] of Object.entries(item)) {
          row[k] = typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "");
        }
      }
      return row;
    });
  } else if (parsed && typeof parsed === "object") {
    const row: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      row[k] = typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "");
    }
    return [row];
  }
  return [];
}
