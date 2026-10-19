import { motion } from 'framer-motion';
import { cn } from './cn';

/** Wadah halaman responsif & ramah ibu jari. */
export function Wadah({ className, children }) {
  return <div className={cn('mx-auto w-full max-w-[680px] p-3.5 sm:p-6 pb-safe space-y-4', className)}>{children}</div>;
}

/** Kartu lembut khas MeongID. */
export function Card({ className, children, ...rest }) {
  return (
    <div className={cn('card p-4 sm:p-5', className)} {...rest}>
      {children}
    </div>
  );
}

/** Kepala halaman konsisten. */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="judul-halaman">{title}</h1>
        {subtitle && <p className="subjudul-halaman">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

const TONES = {
  emerald: 'bg-meong-mintSoft text-emerald-800 border-meong-mint/50',
  amber: 'bg-meong-sunSoft text-amber-800 border-meong-sun/50',
  rose: 'bg-meong-roseSoft text-rose-700 border-meong-rose/50',
  slate: 'bg-white text-meong-muted border-meong-line',
  sky: 'bg-meong-lavenderSoft text-violet-800 border-meong-lavender/50',
};

export function StatusBadge({ tone = 'slate', children, dot = false }) {
  const dots = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-meong-muted',
    sky: 'bg-violet-500',
  };
  return (
    <span className={cn('badge border', TONES[tone] || TONES.slate)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dots[tone] || dots.slate)} />}
      {children}
    </span>
  );
}

/** Pesan sukses / error yang hidup. */
export function Notice({ tone = 'success', children }) {
  if (!children) return null;
  const styles =
    tone === 'success'
      ? 'bg-meong-mintSoft border-meong-mint/60 text-emerald-900'
      : 'bg-meong-roseSoft border-meong-rose/60 text-rose-900';
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-2xl border px-3.5 py-2.5 text-sm font-semibold', styles)}
    >
      {children}
    </motion.p>
  );
}

/** State kosong dengan maskot lucu. */
export function EmptyState({ emoji = '🐱', title, subtitle, action }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-1.5 px-6 py-10 text-center">
      <span className="text-5xl animate-wiggle" aria-hidden="true">
        {emoji}
      </span>
      <p className="mt-1 font-display text-lg font-semibold text-meong-ink">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-meong-muted">{subtitle}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/** Skeleton loading hangat. */
export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-2xl bg-meong-peach/50', className)} />;
}

/** Layar loading penuh halaman. */
export function LayarMemuat({ teks = 'Sebentar ya, meong sedang bersiap...' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <span className="text-5xl animate-wiggle" aria-hidden="true">
        🐱
      </span>
      <p className="text-sm font-semibold text-meong-muted">{teks}</p>
    </div>
  );
}
