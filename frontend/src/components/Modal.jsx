import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from './cn';

/** Modal serbaguna: muncul dari bawah di HP, tengah di desktop. */
export default function Modal({ buka, onTutup, judul, children, lebar = 'sm:max-w-md' }) {
  return (
    <AnimatePresence>
      {buka && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-meong-ink/40 backdrop-blur-[2px]" onClick={onTutup} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={judul}
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className={cn('relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-pop sm:rounded-3xl', lebar)}
          >
            <div className="flex items-center justify-between gap-3 border-b border-meong-line px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-meong-ink">{judul}</h2>
              <button type="button" onClick={onTutup} className="btn-ikon bg-meong-peachSoft text-meong-ink" aria-label="Tutup">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
