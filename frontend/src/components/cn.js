/** Gabung className sederhana (tanpa dependensi). */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}
