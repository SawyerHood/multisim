const CURSOR_COLORS = [
  "tomato",
  "red",
  "ruby",
  "crimson",
  "pink",
  "plum",
  "purple",
  "violet",
  "iris",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "jade",
  "green",
  "grass",
  "orange",
  "mint",
  "sky",
] as const;

function hashUserNameForColor(id: string) {
  return (
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    CURSOR_COLORS.length
  );
}

export function radixColorFromId(id: string) {
  return CURSOR_COLORS[hashUserNameForColor(id)];
}

export function cssVarFromId(id: string) {
  return `var(--${radixColorFromId(id)}-10)`;
}
