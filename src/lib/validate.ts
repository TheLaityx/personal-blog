// Lightweight input validation helpers (no external deps)

export function sanitizeString(input: unknown, maxLen = 500): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, maxLen);
}

export function isValidId(input: unknown): number | null {
  const num = Number(input);
  if (Number.isNaN(num) || num <= 0 || num > 2147483647) return null;
  return num;
}

export function isValidEmail(input: unknown): boolean {
  if (typeof input !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}
