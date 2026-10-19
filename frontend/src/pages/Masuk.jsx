import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { pesanError } from '../api/client';
import { Notice } from '../components/ui';

export default function Masuk() {
  const { pengguna, siap, masuk, daftar } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('masuk');
  const [isi, setIsi] = useState({ nama: '', email: '', password: '' });
  const [galat, setGalat] = useState('');
  const [kirim, setKirim] = useState(false);
  const ubah = (k) => (e) => setIsi((s) => ({ ...s, [k]: e.target.value }));

  if (siap && pengguna) return <Navigate to="/beranda" replace />;

  async function kirimForm(e) {
    e.preventDefault();
    setGalat('');
    setKirim(true);
    try {
      if (mode === 'daftar') {
        await daftar(isi.nama, isi.email, isi.password);
      } else {
        await masuk(isi.email, isi.password);
      }
      navigate('/beranda', { replace: true });
    } catch (err) {
      setGalat(pesanError(err, mode === 'daftar' ? 'Gagal mendaftar. Coba lagi ya.' : 'Gagal masuk. Coba lagi ya.'));
    } finally {
      setKirim(false);
    }
  }

  function isiDemo() {
    setMode('masuk');
    setIsi({ nama: '', email: 'demo@meong.test', password: 'meong123' });
    setGalat('');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-sm">
        <div className="mb-5 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-meong-peach text-4xl shadow-card" aria-hidden="true">
            🐱
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-meong-ink">
            Meong<span className="text-meong-primaryDark">ID</span>
          </h1>
          <p className="mt-1 text-sm text-meong-muted">
            {mode === 'masuk' ? 'Halo lagi! Masuk dulu yuk 😺' : 'Baru di sini? Daftar gratis, yuk! 🐾'}
          </p>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-meong-peachSoft p-1" role="tablist">
            {[
              { id: 'masuk', label: 'Masuk' },
              { id: 'daftar', label: 'Daftar' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={mode === t.id}
                onClick={() => {
                  setMode(t.id);
                  setGalat('');
                }}
                className={`min-h-[44px] rounded-xl text-sm font-bold transition-all ${
                  mode === t.id ? 'bg-white text-meong-primaryDark shadow-card' : 'text-meong-muted'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={kirimForm} className="space-y-4">
            {galat && <Notice tone="error">{galat}</Notice>}

            {mode === 'daftar' && (
              <div>
                <label className="label" htmlFor="nama-masuk">Nama kamu</label>
                <input id="nama-masuk" className="input-besar mt-1" placeholder="Mis. Kak Sinta" value={isi.nama} onChange={ubah('nama')} autoComplete="name" />
              </div>
            )}

            <div>
              <label className="label" htmlFor="email-masuk">Email</label>
              <input id="email-masuk" type="email" className="input-besar mt-1" placeholder="kamu@email.com" value={isi.email} onChange={ubah('email')} autoComplete="email" />
            </div>

            <div>
              <label className="label" htmlFor="sandi-masuk">Kata sandi</label>
              <input id="sandi-masuk" type="password" className="input-besar mt-1" placeholder="Minimal 6 karakter" value={isi.password} onChange={ubah('password')} autoComplete={mode === 'daftar' ? 'new-password' : 'current-password'} />
            </div>

            <button type="submit" className="btn-besar btn-primer w-full" disabled={kirim}>
              {kirim ? 'Sebentar ya...' : mode === 'masuk' ? 'Masuk 🐾' : 'Daftar gratis ✨'}
            </button>
          </form>
        </div>

        <div className="mt-4 text-center">
          <button type="button" onClick={isiDemo} className="text-xs font-semibold text-meong-muted underline decoration-dotted underline-offset-4 hover:text-meong-primaryDark">
            Coba akun demo (demo@meong.test / meong123)
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-meong-muted/80">
            <PawPrint size={12} /> Data hewanmu aman & hanya untuk kamu.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
