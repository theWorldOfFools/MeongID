import { Home, Cat, BellRing, Wallet, Settings } from 'lucide-react';

/** Menu utama aplikasi (dipakai header desktop & bottom nav HP). */
export const MENU = [
  { ke: '/beranda', label: 'Beranda', ikon: Home },
  { ke: '/hewan', label: 'Hewan', ikon: Cat },
  { ke: '/pengingat', label: 'Pengingat', ikon: BellRing },
  { ke: '/pengeluaran', label: 'Pengeluaran', ikon: Wallet },
  { ke: '/pengaturan', label: 'Pengaturan', ikon: Settings },
];

export function menuAktif(pathname, ke) {
  return pathname === ke || (ke !== '/' && pathname.startsWith(ke + '/')) || (ke === '/beranda' && pathname === '/');
}
