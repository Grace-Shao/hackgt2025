/**
 * Small utility to join classNames. Mirrors common `cn` helpers used in Tailwind projects.
 * Returns a single string with truthy args joined by spaces.
 */
function cn(...args) {
  return args
    .flat()
    .filter(Boolean)
    .map((a) => (typeof a === "string" ? a : ""))
    .join(" ")
}

export { cn }
