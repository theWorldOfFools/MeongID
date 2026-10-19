import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/** Animasi lembut setiap pindah halaman. */
export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
