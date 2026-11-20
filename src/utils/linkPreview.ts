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

export function createLinkPreviewPlaceholder(domain: string) {
  const safeDomain = domain.replace(/[<>&"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1d9bf0"/><stop offset="1" stop-color="#7856ff"/></linearGradient></defs><rect width="1200" height="675" fill="url(#g)"/><circle cx="1030" cy="100" r="260" fill="white" opacity=".08"/><circle cx="160" cy="650" r="320" fill="black" opacity=".1"/><text x="600" y="355" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="64" font-weight="700">${safeDomain}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function removePreviewUrl(content: string, previewUrl?: string | null) {
  if (!previewUrl || !content.includes(previewUrl)) return content;

  return content
    .replace(previewUrl, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
