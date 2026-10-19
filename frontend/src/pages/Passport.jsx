import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Phone, PawPrint, Stethoscope } from 'lucide-react';
import api, { pesanError } from '../api/client';
import { Card, LayarMemuat, StatusBadge } from '../components/ui';
import PetAvatar from '../components/PetAvatar';
import { labelUlang, tanggalIndo, umurDari, waLink } from '../utils/format';

/** Halaman PUBLIK (tanpa login): dibuka dari hasil pindai QR paspor hewan. */
export default function Passport() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [galat, setGalat] = useState('');

  useEffect(() => {
    api
      .get(`/api/passport/${token}`)
      .then((r) => setData(r.data))
      .catch((e) => setGalat(pesanError(e, 'Paspor tidak ditemukan. Cek lagi tautannya ya 🐾')));
  }, [token]);

  if (galat) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="text-6xl" aria-hidden="true">🙀</span>
        <h1 className="font-display text-2xl font-semibold">Paspor tidak ditemukan</h1>
        <p className="max-w-sm text-sm text-meong-muted">{galat}</p>
      </div>
    );
  }

  if (!data) return <LayarMemuat teks="Membuka paspor digital..." />;

  const { hewan, kontak_darurat: kontak, riwayat_vaksin: vaksin } = data;
  const umur = umurDari(hewan.tanggal_lahir);
  const teleponBersih = String(kontak.telepon || '').replace(/[^\d+]/g, '');
  const wa = waLink(kontak.telepon);

  return (
    <div className="min-h-screen bg-gradient-to-b from-meong-peachSoft via-meong-bg to-meong-roseSoft/60 p-4 pb-10">
      <div className="mx-auto max-w-md space-y-4">
        <header className="flex items-center justify-center gap-2 pt-2 text-meong-primaryDark">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-card">
            <PawPrint size={20} />
          </span>
          <span className="font-display text-lg font-semibold">Paspor Digital MeongID</span>
        </header>

        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-r from-meong-peach to-meong-roseSoft p-5">
            <div className="flex items-center gap-4">
              <PetAvatar pet={hewan} ukuran="h-24 w-24" teks="text-5xl" className="border-4 border-white/80 shadow-card" />
              <div className="min-w-0">
                <h1 className="truncate font-display text-3xl font-semibold text-meong-ink">{hewan.nama}</h1>
                <p className="text-sm font-semibold text-meong-ink/70">
                  {hewan.spesies}
                  {hewan.ras ? ` • ${hewan.ras}` : ''}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {hewan.jenis_kelamin && (
                    <StatusBadge tone={hewan.jenis_kelamin === 'betina' ? 'rose' : 'sky'}>
                      {hewan.jenis_kelamin === 'betina' ? '♀ Betina' : '♂ Jantan'}
                    </StatusBadge>
                  )}
                  {umur && <StatusBadge tone="amber">{umur}</StatusBadge>}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-meong-line">
            {[
              { label: 'Berat terakhir', nilai: hewan.berat_badan_kg ? `${Number(hewan.berat_badan_kg)} kg` : null },
              { label: 'Golongan darah', nilai: hewan.golongan_darah || null },
              { label: 'Nomor cip', nilai: hewan.nomor_cip || null },
              { label: 'Lahir', nilai: hewan.tanggal_lahir ? tanggalIndo(hewan.tanggal_lahir) : null },
            ].map((item) => (
              <div key={item.label} className="bg-white p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-meong-muted">{item.label}</p>
                <p className={`mt-0.5 text-sm font-bold ${item.nilai ? 'text-meong-ink' : 'italic text-meong-muted/60'}`}>
                  {item.nilai || 'Belum diisi'}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {hewan.alergi && (
          <Card className="border-meong-rose/60 bg-meong-roseSoft/80 p-4">
            <p className="flex items-center gap-2 text-sm font-extrabold text-rose-700">
              <AlertTriangle size={17} /> PENTING — Riwayat alergi
            </p>
            <p className="mt-1 text-sm font-semibold text-rose-900">{hewan.alergi}</p>
          </Card>
        )}

        {hewan.catatan_darurat && (
          <Card className="border-meong-sun/70 bg-meong-sunSoft/80 p-4">
            <p className="flex items-center gap-2 text-sm font-extrabold text-amber-800">
              <Stethoscope size={17} /> Catatan darurat
            </p>
            <p className="mt-1 text-sm font-semibold text-amber-900">{hewan.catatan_darurat}</p>
          </Card>
        )}

        {vaksin.length > 0 && (
          <Card className="p-4">
            <h2 className="font-display text-base font-semibold">Riwayat vaksin 💉</h2>
            <ul className="mt-2 divide-y divide-meong-line">
              {vaksin.map((v, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2">
                  <span className="truncate text-sm font-semibold text-meong-ink">{v.judul}</span>
                  <span className="shrink-0 text-xs font-bold text-meong-muted">
                    {v.selesai ? `Beres ${tanggalIndo(v.selesai)}` : `Jadwal ${tanggalIndo(v.jadwal)}`}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="p-4">
          <h2 className="font-display text-base font-semibold">Menemukan {hewan.nama}? 🥺</h2>
          {teleponBersih || kontak.nama ? (
            <>
              <p className="mt-1 text-sm text-meong-muted">
                Tolong hubungi <span className="font-bold text-meong-ink">{kontak.nama || 'pemiliknya'}</span>. Terima kasih banyak sudah menolong!
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {teleponBersih && (
                  <a href={`tel:${teleponBersih}`} className="btn-besar btn-primer">
                    <Phone size={17} /> Telepon
                  </a>
                )}
                {wa && (
                  <a href={wa} target="_blank" rel="noreferrer" className={`btn-besar ${teleponBersih ? 'btn-mint' : 'btn-primer col-span-2'}`}>
                    💬 WhatsApp
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="mt-1 text-sm text-meong-muted">Pemilik belum mencantumkan kontak darurat di paspor ini.</p>
          )}
        </Card>

        <p className="text-center text-xs text-meong-muted">
          Dibuat dengan <span className="font-bold text-meong-primaryDark">MeongID</span> 🐾 — teman harian pet parents
        </p>
      </div>
    </div>
  );
}
