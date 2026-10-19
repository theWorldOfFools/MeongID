/** Referensi kategori & jenis MeongID — dipakai bareng backend (enum yang sama). */

export const SPESIES = ['Kucing', 'Anjing', 'Kelinci', 'Hamster', 'Burung', 'Lainnya'];

export const KATEGORI_PENGELUARAN = [
  { id: 'makanan', label: 'Makanan', emoji: '🍖', warna: '#E8A2B0' },
  { id: 'pasir_perlengkapan', label: 'Pasir & Perlengkapan', emoji: '🧺', warna: '#C3AEDF' },
  { id: 'medis_vaksin', label: 'Medis & Vaksin', emoji: '💉', warna: '#8ED4B2' },
  { id: 'grooming', label: 'Grooming', emoji: '🛁', warna: '#F6C177' },
  { id: 'lainnya', label: 'Lainnya', emoji: '✨', warna: '#C9B8AD' },
];

export function kategoriInfo(id) {
  return KATEGORI_PENGELUARAN.find((k) => k.id === id) || KATEGORI_PENGELUARAN[KATEGORI_PENGELUARAN.length - 1];
}

export const JENIS_REMINDER = [
  { id: 'vaksin', label: 'Vaksin', emoji: '💉', warna: '#8ED4B2' },
  { id: 'obat_cacing', label: 'Obat Cacing', emoji: '🪱', warna: '#E8A2B0' },
  { id: 'obat_kutu', label: 'Obat Kutu & Caplak', emoji: '🧴', warna: '#C3AEDF' },
  { id: 'grooming', label: 'Grooming', emoji: '✂️', warna: '#F6C177' },
  { id: 'lainnya', label: 'Lainnya', emoji: '📌', warna: '#C9B8AD' },
];

export function jenisInfo(id) {
  return JENIS_REMINDER.find((j) => j.id === id) || JENIS_REMINDER[JENIS_REMINDER.length - 1];
}

export const OPSI_ULANG = [
  { nilai: '', label: 'Sekali saja' },
  { nilai: 7, label: 'Setiap minggu' },
  { nilai: 30, label: 'Setiap bulan' },
  { nilai: 90, label: 'Setiap 3 bulan' },
  { nilai: 180, label: 'Setiap 6 bulan' },
  { nilai: 365, label: 'Setiap tahun' },
];

export function emojiSpesies(spesies) {
  const s = String(spesies || '').toLowerCase();
  if (s.includes('kucing')) return '🐱';
  if (s.includes('anjing')) return '🐶';
  if (s.includes('kelinci')) return '🐰';
  if (s.includes('hamster')) return '🐹';
  if (s.includes('burung')) return '🐦';
  return '🐾';
}
