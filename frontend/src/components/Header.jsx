import { Link, useLocation } from 'react-router-dom';
import { PawPrint, Sparkles } from 'lucide-react';
import { MENU, menuAktif } from './menu';
import { useAuth } from '../context/AuthContext';
import { cn } from './cn';

export default function Header() {
  const { pengguna } = useAuth();
  const { pathname } = useLocation();
  const premium = pengguna?.tier === 'premium';

  return (
    <header className="sticky top-0 z-30 border-b border-meong-line/70 bg-meong-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[680px] items-center justify-between gap-3 px-3.5 sm:px-6">
        <Link to="/beranda" className="flex items-center gap-2.5" aria-label="MeongID Beranda">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-meong-peach text-meong-primaryDark shadow-card">
            <PawPrint size={20} strokeWidth={2.4} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">MeongID</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {MENU.map((m) => {
            const aktif = menuAktif(pathname, m.ke);
            return (
              <Link
                key={m.ke}
                to={m.ke}
                className={cn(
                  'flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                  aktif ? 'bg-meong-peachSoft text-meong-primaryDark' : 'text-meong-muted hover:bg-white hover:text-meong-ink'
                )}
              >
                <m.ikon size={18} strokeWidth={aktif ? 2.6 : 2.2} />
                {m.label}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/pengaturan"
          className={cn(
            'chip shadow-card',
            premium && 'border-meong-sun/70 bg-meong-sunSoft text-amber-800'
          )}
          aria-label={premium ? 'Paket Premium aktif' : 'Paket Gratis — lihat Premium'}
        >
          <Sparkles size={14} />
          {premium ? 'Premium' : 'Gratis'}
        </Link>
      </div>
    </header>
  );
}
