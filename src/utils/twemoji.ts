/** @format */

import twemoji from "twemoji";

const options = {
  folder: "svg",
  ext: ".svg",
  className: "twemoji",
};

export function parseEmoji(text: string) {
  return twemoji.parse(text, options);
}
