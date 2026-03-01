export interface ParsedPoem {
  title?: string;
  lines?: string[];
}

/**
 * Attempts to parse a complete JSON poem response from the model.
 * Extracts the first `{...}` block found in the text.
 */
export function tryParseJson(text: string): ParsedPoem | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ParsedPoem;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Extracts partial poem data from a streaming JSON response that may be
 * incomplete (e.g. the closing `}` hasn't arrived yet).
 * Uses regex rather than JSON.parse so it tolerates truncated output.
 */
export function tryParsePartialJson(text: string): ParsedPoem | null {
  try {
    const titleMatch = text.match(/"title"\s*:\s*"([^"]*)"/);
    const linesMatch = text.match(/"lines"\s*:\s*\[([\s\S]*?)(?:\]|$)/);

    if (!titleMatch && !linesMatch) return null;

    const result: ParsedPoem = {};

    if (titleMatch) {
      result.title = titleMatch[1];
    }

    if (linesMatch) {
      const lineMatches = linesMatch[1].matchAll(/"([^"]*)"/g);
      result.lines = Array.from(lineMatches, (m) => m[1]);
    }

    return result;
  } catch {
    return null;
  }
}
