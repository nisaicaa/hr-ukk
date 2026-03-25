export function normalizeEmail(input: string): string {
  if (!input) return "";

  const lower = input.trim().toLowerCase();

  if (lower.includes("@")) {
    return lower;
  }

  return `${lower}@gmail.com`;
}