export const AVATAR_DEFAULT_NAME = "User";
export const AVATAR_INITIALS_LIMIT = 2;

// Якщо скажуть що нейтральні градієнти занадто тусклі і треба щось яскравіше
// const gradients = [
//   "from-sky-400 to-blue-600",
//   "from-violet-400 to-fuchsia-600",
//   "from-pink-400 to-rose-600",
//   "from-teal-400 to-emerald-600",
//   "from-indigo-400 to-violet-600",
//   "from-orange-400 to-red-600",
//   "from-blue-400 to-indigo-600",
//   "from-cyan-400 to-blue-600",
// ] as const;

// Нейтральні градієнти
export const AVATAR_GRADIENTS = [
  ["to bottom right", 5, 15],
  ["to bottom left", 5, 15],
  ["to top right", 5, 15],
  ["to top left", 5, 15],
  ["to bottom right", 8, 22],
  ["to bottom left", 8, 22],
  ["to top right", 8, 22],
  ["to top left", 8, 22],
] as const;
