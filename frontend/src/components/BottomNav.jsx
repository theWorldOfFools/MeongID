import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MENU, menuAktif } from './menu';
import { cn } from './cn';

/** Bottom navigation mengapung: thumb-friendly (target ≥48px) & aman gestur bar. */
export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 pointer-events-none safe-bottom md:hidden"
      aria-label="Navigasi bawah"
    >
      <div className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto flex max-w-md items-stretch gap-0.5 rounded-3xl border border-meong-line bg-white/95 px-1.5 py-1.5 shadow-pop backdrop-blur-md">
          {MENU.map((m) => {
            const aktif = menuAktif(pathname, m.ke);
            return (
              <NavLink key={m.ke} to={m.ke} className="min-w-0 flex-1" aria-label={m.label}>
                <motion.span
                  whileTap={{ scale: 0.92 }}
                  className={cn(
                    'relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 text-[10.5px] font-bold transition-colors',
                    aktif ? 'text-meong-primaryDark' : 'text-meong-muted'
                  )}
                >
                  {aktif && (
                    <motion.span
                      layoutId="nav-aktif"
                      transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                      className="absolute inset-0 rounded-2xl border border-meong-peach bg-meong-peachSoft"
                    />
                  )}
                  <m.ikon size={20} strokeWidth={aktif ? 2.6 : 2.1} className="relative" />
                  <span className="relative w-full truncate text-center leading-tight">{m.label}</span>
                </motion.span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
