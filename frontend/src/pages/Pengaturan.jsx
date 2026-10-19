import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, PawPrint, Save, Sparkles } from 'lucide-react';
import api, { pesanError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, Notice, PageHeader, StatusBadge, Wadah } from '../components/ui';

const FITUR_PREMIUM = ['Profil hewan tanpa batas', 'Ekspor laporan keuangan bulanan', 'Galeri resolusi tinggi tanpa batas'];
const FITUR_FREE = ['Maksimal 2 profil hewan', 'Pengingat & paspor QR standar', 'Pencatatan pengeluaran dasar'];

export default function Pengaturan() {
  const { pengguna, setPengguna, keluar } = useAuth();
  const navigate = useNavigate();
  const [isi, setIsi] = useState({ nama: pengguna?.nama || '', telepon: pengguna?.telepon || '' });
  const [pesan, setPesan] = useState('');
  const [galat, setGalat] = useState('');
  const [simpan, setSimpan] = useState(false);
  const [prosesPaket, setProsesPaket] = useState(false);
  const premium = pengguna?.tier === 'premium';

  async function simpanProfil(e) {
    e.preventDefault();
    setPesan('');
    setGalat('');
    setSimpan(true);
    try {
      const { data } = await api.put('/api/auth/me', isi);
      setPengguna((p) => ({ ...p, ...data }));
      setPesan('Profil tersimpan! Kontak darurat otomatis tampil di paspor QR ✨');
    } catch (err) {
      setGalat(pesanError(err));
    } finally {
      setSimpan(false);
    }
  }

  async function ubahPaket(ke) {
    setPesan('');
    setGalat('');
    setProsesPaket(true);
    try {
      const { data } = await api.post(`/api/auth/${ke}`);
      setPengguna((p) => ({ ...p, ...data.pengguna }));
      setPesan(data.pesan);
    } catch (err) {
      setGalat(pesanError(err));
    } finally {
      setProsesPaket(false);
    }
  }

  function keluarAplikasi() {
    keluar();
    navigate('/masuk', { replace: true });
  }

  return (
    <Wadah>
      <PageHeader title="Pengaturan" subtitle="Profil pemilik, paket, dan kontak darurat 🐾" />

      {pesan && <Notice>{pesan}</Notice>}
      {galat && <Notice tone="error">{galat}</Notice>}

      <Card className="p-4 sm:p-5">
        <h2 className="font-display text-lg font-semibold">Profil pemilik</h2>
        <p className="mb-4 mt-0.5 text-xs text-meong-muted">Nama & telepon ini yang muncul di halaman paspor QR saat hewan ditemukan orang lain.</p>
        <form onSubmit={simpanProfil} className="space-y-3.5">
          <div>
            <label className="label" htmlFor="nama-profil">Nama</label>
            <input id="nama-profil" className="input-besar mt-1" value={isi.nama} onChange={(e) => setIsi((s) => ({ ...s, nama: e.target.value }))} />
          </div>
          <div>
            <label className="label" htmlFor="telepon-profil">Kontak darurat (HP/WA)</label>
            <input id="telepon-profil" className="input-besar mt-1" placeholder="Mis. 0812-3456-7890" value={isi.telepon} onChange={(e) => setIsi((s) => ({ ...s, telepon: e.target.value }))} />
          </div>
          <button type="submit" className="btn-besar btn-primer w-full" disabled={simpan}>
            <Save size={17} /> {simpan ? 'Menyimpan...' : 'Simpan profil'}
          </button>
        </form>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Paket kamu</h2>
          <StatusBadge tone={premium ? 'amber' : 'slate'} dot>
            {premium ? 'Premium' : 'Gratis'}
          </StatusBadge>
        </div>
        <ul className="mt-3 space-y-1.5">
          {(premium ? FITUR_PREMIUM : FITUR_FREE).map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-meong-muted">
              <span className="text-meong-primaryDark">✦</span> {f}
            </li>
          ))}
        </ul>
        {premium ? (
          <button className="btn-besar btn-lembut mt-4 w-full" onClick={() => ubahPaket('downgrade')} disabled={prosesPaket}>
            {prosesPaket ? 'Memproses...' : 'Kembali ke paket Gratis (demo)'}
          </button>
        ) : (
          <>
            <p className="mt-3 text-xs text-meong-muted">
              Upgrade Premium membuka semua fitur. (Mode demo: tanpa pembayaran, langsung aktif.)
            </p>
            <button className="btn-besar btn-primer mt-3 w-full" onClick={() => ubahPaket('upgrade')} disabled={prosesPaket}>
              <Sparkles size={17} /> {prosesPaket ? 'Memproses...' : 'Coba Premium gratis (demo)'}
            </button>
          </>
        )}
      </Card>

      <Card className="flex items-center gap-3 p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-meong-peachSoft text-meong-primaryDark">
          <PawPrint size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-meong-ink">MeongID v1</p>
          <p className="text-xs text-meong-muted">Teman harian pet parents: profil, pengingat, paspor QR, pengeluaran, jurnal tumbuh kembang.</p>
        </div>
      </Card>

      <button className="btn-besar btn-bahaya-lembut w-full" onClick={keluarAplikasi}>
        <LogOut size={17} /> Keluar dari akun
      </button>
    </Wadah>
  );
}
