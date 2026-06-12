import { describe, it, expect } from "vitest";
import { parseCSV, parseJSONData } from "./runner";

describe("parseCSV", () => {
  it("parses simple CSV", () => {
    const csv = `
      username, apiKey, active
      user1, key1, true
      user2, key2, false
    `;
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ username: "user1", apiKey: "key1", active: "true" });
    expect(rows[1]).toEqual({ username: "user2", apiKey: "key2", active: "false" });
  });

  it("handles commas inside double quotes", () => {
    const csv = `
      name, description
      "John Doe", "Engineer, Lead"
      "Jane, Smith", "Manager"
    `;
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: "John Doe", description: "Engineer, Lead" });
    expect(rows[1]).toEqual({ name: "Jane, Smith", description: "Manager" });
  });

  it("handles escaped quotes", () => {
    const csv = `
      name, quote
      "Doge", "He said, ""much wow"""
    `;
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ name: "Doge", quote: 'He said, "much wow"' });
  });
});

describe("parseJSONData", () => {
  it("parses JSON array of objects", () => {
    const json = `[
      {"name": "Alice", "age": 30},
      {"name": "Bob", "age": 25}
    ]`;
    const rows = parseJSONData(json);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: "Alice", age: "30" });
    expect(rows[1]).toEqual({ name: "Bob", age: "25" });
  });

  it("parses single JSON object as one iteration", () => {
    const json = `{"name": "Charlie", "role": "admin"}`;
    const rows = parseJSONData(json);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ name: "Charlie", role: "admin" });
  });
});
