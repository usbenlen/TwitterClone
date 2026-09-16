const HTTP_URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;
const TRAILING_PUNCTUATION = /[.,!?;:]+$/;

function trimUnbalancedClosingCharacters(url: string) {
  let result = url.replace(TRAILING_PUNCTUATION, "");

  const pairs: Array<[string, string]> = [
    ["(", ")"],
    ["[", "]"],
    ["{", "}"],
  ];

  for (const [opening, closing] of pairs) {
    while (
      result.endsWith(closing) &&
      result.split(closing).length > result.split(opening).length
    ) {
      result = result.slice(0, -1);
    }
  }

  return result;
}

export function findFirstHttpUrl(value: string): string | null {
  const matches = value.match(HTTP_URL_PATTERN);
  if (!matches?.[0]) return null;

  const candidate = trimUnbalancedClosingCharacters(matches[0]);

  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:"
      ? candidate
      : null;
  } catch {
    return null;
  }
}

export function getDisplayDomain(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./i, "");
  } catch {
    return value;
  }
}

export function removePreviewUrl(content: string, previewUrl?: string | null) {
  if (!previewUrl || !content.includes(previewUrl)) return content;

  return content
    .replace(previewUrl, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
