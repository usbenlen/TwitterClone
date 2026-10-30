/** Normalize whitespace for display without changing stored content or drafts. */
export function normalizeDisplayText(text: string): string {
  return text
    .replace(/\r\n?|\u2028|\u2029/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeInlineDisplayText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
