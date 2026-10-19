import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Guard from './components/Guard';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import PageTransition from './components/PageTransition';
import { LayarMemuat } from './components/ui';
import Masuk from './pages/Masuk';
import Beranda from './pages/Beranda';
import Hewan from './pages/Hewan';
import HewanDetail from './pages/HewanDetail';
import Pengingat from './pages/Pengingat';
import Pengeluaran from './pages/Pengeluaran';
import Pengaturan from './pages/Pengaturan';
import Passport from './pages/Passport';

function RuteAwal() {
  const { pengguna, siap } = useAuth();
  if (!siap) return <LayarMemuat />;
  return <Navigate to={pengguna ? '/beranda' : '/masuk'} replace />;
}

/** Kerangka aplikasi setelah login: header + halaman + bottom nav. */
function Aplikasi() {
  return (
    <Guard>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <PageTransition>
            <Routes>
              <Route path="/beranda" element={<Beranda />} />
              <Route path="/hewan" element={<Hewan />} />
              <Route path="/hewan/:id" element={<HewanDetail />} />
              <Route path="/pengingat" element={<Pengingat />} />
              <Route path="/pengeluaran" element={<Pengeluaran />} />
              <Route path="/pengaturan" element={<Pengaturan />} />
              <Route path="*" element={<Navigate to="/beranda" replace />} />
            </Routes>
          </PageTransition>
        </main>
        <footer className="hidden py-4 text-center text-xs text-meong-muted md:block">
          MeongID • Teman harian pet parents 🐾
        </footer>
        <BottomNav />
      </div>
    </Guard>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/masuk" element={<Masuk />} />
          <Route path="/passport/:token" element={<Passport />} />
          <Route path="/" element={<RuteAwal />} />
          <Route path="*" element={<Aplikasi />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
