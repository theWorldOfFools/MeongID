/** Format tanggal & usia ala MeongID (bahasa Indonesia, hangat dan ringkas). */

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** 'YYYY-MM-DD' -> Date lokal (aman dari pergeseran timezone). */
export function keDate(str) {
  if (!str) return null;
  const [y, m, d] = String(str).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** 'YYYY-MM-DD' -> '14 Mar 2023' */
export function tanggalIndo(str, { panjang = false } = {}) {
  const dt = keDate(str);
  if (!dt) return '-';
  const bulan = panjang ? BULAN_PANJANG[dt.getMonth()] : BULAN[dt.getMonth()];
  return `${dt.getDate()} ${bulan} ${dt.getFullYear()}`;
}

/** Usia dari tanggal lahir: '2 th 7 bln' | '8 bln' | 'Baru lahir' */
export function umurDari(str) {
  const lahir = keDate(str);
  if (!lahir) return null;
  const now = new Date();
  let bulan = (now.getFullYear() - lahir.getFullYear()) * 12 + (now.getMonth() - lahir.getMonth());
  if (now.getDate() < lahir.getDate()) bulan -= 1;
  if (bulan < 0) return 'Belum lahir?';
  const th = Math.floor(bulan / 12);
  const sisa = bulan % 12;
  if (th <= 0 && sisa <= 0) return 'Baru lahir';
  if (th <= 0) return `${sisa} bln`;
  if (sisa === 0) return `${th} th`;
  return `${th} th ${sisa} bln`;
}

/** Selisih hari dari hari ini ke tanggal target (negatif = sudah lewat). */
export function selisihHari(str) {
  const target = keDate(str);
  if (!target) return null;
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  return Math.round((target - hariIni) / 86400000);
}

/** Label relatif pengingat: { teks, tone } */
export function labelJadwal(str) {
  const d = selisihHari(str);
  if (d === null) return { teks: '-', tone: 'slate' };
  if (d < 0) return { teks: `Terlambat ${Math.abs(d)} hari`, tone: 'rose' };
  if (d === 0) return { teks: 'Hari ini', tone: 'amber' };
  if (d === 1) return { teks: 'Besok', tone: 'amber' };
  if (d <= 7) return { teks: `H-${d}`, tone: 'sky' };
  return { teks: `H-${d}`, tone: 'slate' };
}

/** Label pengulangan yang ramah. */
export function labelUlang(hari) {
  if (!hari) return 'Sekali saja';
  const n = Number(hari);
  if (n === 1) return 'Setiap hari';
  if (n === 7) return 'Setiap minggu';
  if (n === 30) return 'Setiap bulan';
  if (n === 90) return 'Setiap 3 bulan';
  if (n === 180) return 'Setiap 6 bulan';
  if (n === 365) return 'Setiap tahun';
  return `Setiap ${n} hari`;
}

/** Nomor telepon -> tautan whatsapp yang aman. */
export function waLink(telepon) {
  const bersih = String(telepon || '').replace(/[^\d+]/g, '').replace(/^\+/, '');
  if (!bersih) return null;
  const pakai62 = bersih.startsWith('0') ? `62${bersih.slice(1)}` : bersih;
  return `https://wa.me/${pakai62}`;
}
