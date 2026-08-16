import twemoji from "twemoji";

const options = {
  folder: "svg",
  ext: ".svg",
  className: "twemoji",
};

export function parseEmoji(target: string | HTMLElement): string | HTMLElement {
  return twemoji.parse(target, options);
}
