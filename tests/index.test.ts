import { heal } from "../src/index";

describe("heal function", () => {
  test("should return undefined for empty input", () => {
    expect(heal("")).toBeUndefined();
  });

  test("should parse a complete JSON string correctly", () => {
    const input = JSON.stringify({
      key: "value",
      nested: { subKey: "subValue" },
    });
    expect(heal(input)).toEqual(JSON.parse(input));
  });

  test("should handle missing closing brace", () => {
    const input = '{"key":"value", "nested": {"subKey":"subValue"';
    const expected = {
      key: "value",
      nested: { subKey: "subValue" },
    };
    expect(heal(input)).toEqual(expected);
  });

  test("should handle missing closing bracket", () => {
    const input = '{"key":"value", "array": [1, 2, 3';
    const expected = {
      key: "value",
      array: [1, 2, 3],
    };
    expect(heal(input)).toEqual(expected);
  });

  test("should handle unterminated string", () => {
    const input = '{"key":"value", "nested": {"subKey":"subVal';
    const expected = {
      key: "value",
      nested: { subKey: "subVal" },
    };
    expect(heal(input)).toEqual(expected);
  });

  test("should handle unexpected comma", () => {
    const input = '{"key":"value", "nested": {"subKey":"subValue",}}';
    const expected = {
      key: "value",
      nested: { subKey: "subValue" },
    };
    expect(heal(input)).toEqual(expected);
  });

  test("should handle incomplete boolean values", () => {
    const input = '{"active":tru';
    const expected = { active: true };
    expect(heal(input)).toEqual(expected);
  });

  test("should handle incomplete null values", () => {
    const input = '{"data":nul';
    const expected = { data: null };
    expect(heal(input)).toEqual(expected);
  });

  test("should handle single open brace and bracket", () => {
    expect(heal("{")).toEqual({});
    expect(heal("[")).toEqual([]);
  });

  test("should handle raw values", () => {
    expect(heal("1")).toEqual(1);
    expect(heal("true")).toEqual(true);
    expect(heal('"example"')).toEqual("example");
    expect(heal("null")).toEqual(null);
  });

  test("should handle truncations progressively", () => {
    const json = {
      company: {
        name: "Tech Solutions Inc.",
        employees: [
          {
            id: 1,
            name: "Alice Smith",
            active: true,
          },
        ],
      },
    };
    const stringifiedJSON = JSON.stringify(json, null, 2);

    for (let i = 0; i < stringifiedJSON.length; i++) {
      const result = heal(stringifiedJSON.slice(0, i));
      if (i === 0) {
        expect(result).toBeUndefined();
      }
      if (result !== undefined) {
        expect(typeof result).toBe("object");
      }
    }
  });
});
