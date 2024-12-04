function heal(jsonString: string) {
  if (jsonString.trim().length === 0) return undefined;

  for (let jsonIndex = 0; jsonIndex < jsonString.length; jsonIndex++) {
    let json =
      jsonIndex !== 0 ? jsonString.slice(0, (jsonIndex + 1) * -1) : jsonString;

    let stack: string[] = [];
    let output = "";
    let insideString = false;
    let currentKey = "";
    let isCollectingKey = false;
    let lastPropertyComplete = true;
    let depth = 0;

    for (let i = 0; i < json.length; i++) {
      const char = json[i];
      // Handle strings
      if (char === '"') {
        if (!insideString) {
          insideString = true;
          isCollectingKey = depth > 0 && !lastPropertyComplete;
        } else if (json[i - 1] !== "\\") {
          insideString = false;
          isCollectingKey = false;
        }
      }

      if (insideString && isCollectingKey) {
        currentKey += char;
      }

      output += char;

      if (insideString) continue;

      // Handle colons (property separator)
      if (char === ":") {
        lastPropertyComplete = false;
      }

      // Handle commas (value separator)
      if (char === ",") {
        lastPropertyComplete = true;
        currentKey = "";
      }

      // Handle opening brackets
      if (char === "{" || char === "[") {
        stack.push(char);
        depth++;
      }

      // Handle closing brackets
      if (char === "}" || char === "]") {
        const last = stack.pop();
        depth--;
        if ((char === "}" && last !== "{") || (char === "]" && last !== "[")) {
          throw new Error("Mismatched brackets in JSON.");
        }
        lastPropertyComplete = true;
      }
    }

    // Close open strings
    if (insideString) {
      output += '"';
    }

    // Handle incomplete values
    if (!lastPropertyComplete) {
      const lastWord = json.trim().split(" ").pop() || "";
      const lastWordViaColon = json.trim().split(":").pop() || "";

      if ("true".startsWith(lastWord)) {
        output += "true".slice(lastWord.length); // Complete 'true'
      } else if ("false".startsWith(lastWord)) {
        output += "false".slice(lastWord.length); // Complete 'false'
      } else if ("null".startsWith(lastWord)) {
        output += "null".slice(lastWord.length); // Complete 'null'
      }

      if ("true".startsWith(lastWordViaColon)) {
        output += "true".slice(lastWordViaColon.length); // Complete 'true'
      } else if ("false".startsWith(lastWordViaColon)) {
        output += "false".slice(lastWordViaColon.length); // Complete 'false'
      } else if ("null".startsWith(lastWordViaColon)) {
        output += "null".slice(lastWordViaColon.length); // Complete 'null'
      }
    }

    // Close remaining structures
    while (stack.length > 0) {
      const last = stack.pop();
      output += last === "{" ? "}" : "]";
    }

    try {
      return JSON.parse(output);
    } catch (e) {
      continue;
    }
  }

  return undefined;
}

export { heal };
