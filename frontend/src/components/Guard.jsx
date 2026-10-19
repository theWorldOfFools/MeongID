import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayarMemuat } from './ui';

/** Bungkus halaman yang butuh login. */
export default function Guard({ children }) {
  const { pengguna, siap } = useAuth();
  if (!siap) return <LayarMemuat />;
  if (!pengguna) return <Navigate to="/masuk" replace />;
  return children;
}
