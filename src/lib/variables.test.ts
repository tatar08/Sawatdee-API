import { describe, it, expect } from "vitest";
import { resolve, findUnresolved, buildVars } from "./variables";
import type { Environment } from "./types";

describe("resolve", () => {
  it("replaces known variables", () => {
    expect(resolve("https://{{host}}/users/{{id}}", { host: "api.x.com", id: "7" })).toBe(
      "https://api.x.com/users/7",
    );
  });

  it("leaves unknown variables untouched", () => {
    expect(resolve("{{a}}-{{b}}", { a: "1" })).toBe("1-{{b}}");
  });

  it("tolerates whitespace inside braces", () => {
    expect(resolve("{{ host }}", { host: "x" })).toBe("x");
  });

  it("replaces with empty string values", () => {
    expect(resolve("{{a}}!", { a: "" })).toBe("!");
  });
});

describe("findUnresolved", () => {
  it("returns unique missing names", () => {
    expect(findUnresolved("{{a}}/{{b}}/{{b}}", { a: "1" })).toEqual(["b"]);
  });

  it("empty when all resolve", () => {
    expect(findUnresolved("{{a}}", { a: "1" })).toEqual([]);
  });
});

describe("buildVars", () => {
  const env: Environment = {
    id: "e1",
    name: "test",
    variables: [
      { id: "1", key: "host", value: "env-host", enabled: true },
      { id: "2", key: "off", value: "x", enabled: false },
    ],
  };

  it("environment overrides collection vars; disabled skipped", () => {
    const vars = buildVars(env, [
      { id: "3", key: "host", value: "col-host", enabled: true },
      { id: "4", key: "colOnly", value: "y", enabled: true },
    ]);
    expect(vars).toEqual({ host: "env-host", colOnly: "y" });
  });

  it("handles null environment", () => {
    expect(buildVars(null)).toEqual({});
  });
});
