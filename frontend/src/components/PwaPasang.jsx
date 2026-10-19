import { useEffect, useState } from 'react';
import { Download, Share, Smartphone } from 'lucide-react';
import { siapPasang, modeBerdiri, mintaPasang, perangkatIOS } from '../pwa';
import { Card, Notice } from './ui';

/** Kartu "Pasang aplikasi" (Chrome/Edge Android & desktop; panduan iOS Safari). */
export default function PwaPasang() {
  const [bisaPasang, setBisaPasang] = useState(siapPasang());
  const [berdiri, setBerdiri] = useState(modeBerdiri());
  const [pesan, setPesan] = useState('');
  const [sedang, setSedang] = useState(false);

  useEffect(() => {
    const onBerubah = () => {
      setBisaPasang(siapPasang());
      setBerdiri(modeBerdiri());
    };
    window.addEventListener('pwa-install-berubah', onBerubah);
    return () => window.removeEventListener('pwa-install-berubah', onBerubah);
  }, []);

  if (berdiri) {
    return (
      <Card className="flex items-center gap-3 border-meong-mint/60 bg-meong-mintSoft/60 p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-emerald-700">
          <Smartphone size={20} />
        </span>
        <div>
          <p className="text-sm font-bold text-meong-ink">App mode aktif 🎉</p>
          <p className="text-xs text-meong-muted">MeongID sedang berjalan sebagai aplikasi terpasang.</p>
        </div>
      </Card>
    );
  }

  const tampilkanIos = perangkatIOS() && !bisaPasang;
  if (!bisaPasang && !tampilkanIos) return null;

  async function pasang() {
    setSedang(true);
    const hasil = await mintaPasang();
    if (hasil === 'accepted') setPesan('Yeay! MeongID terpasang di perangkatmu 🎉');
    setSedang(false);
  }

  return (
    <Card className="border-meong-lavender/50 bg-meong-lavenderSoft/60 p-4 sm:p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Download size={19} /> Pasang aplikasi MeongID
      </h2>
      <p className="mt-1 text-xs text-meong-muted">
        Buka layar penuh tanpa browser, punya ikon sendiri di layar utama HP/desktop, dan tetap bisa dibuka saat koneksi sedang buruk.
      </p>
      {pesan && <div className="mt-3"><Notice>{pesan}</Notice></div>}
      {bisaPasang ? (
        <button type="button" className="btn-besar btn-primer mt-3 w-full" onClick={pasang} disabled={sedang}>
          <Download size={17} /> {sedang ? 'Menunggu konfirmasi...' : 'Pasang sekarang'}
        </button>
      ) : (
        <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-white/80 p-3.5">
          <Share size={18} className="mt-0.5 shrink-0 text-meong-primaryDark" />
          <p className="text-xs font-semibold text-meong-ink">
            Di iPhone/iPad: tap tombol <span className="font-bold">Bagikan</span> di Safari, lalu pilih{' '}
            <span className="font-bold">"Tambah ke Layar Utama"</span> 🐾
          </p>
        </div>
      )}
    </Card>
  );
}
