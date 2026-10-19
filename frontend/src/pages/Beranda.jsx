import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, Cat, Plus, Sparkles, Wallet } from 'lucide-react';
import api, { rupiah } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, EmptyState, Skeleton, StatusBadge, Wadah } from '../components/ui';
import PetAvatar from '../components/PetAvatar';
import { jenisInfo } from '../data/kategori';
import { labelJadwal, umurDari } from '../utils/format';

function singkatRp(n) {
  const v = Number(n || 0);
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1).replace('.', ',')}jt`;
  if (v >= 1000) return `Rp${Math.round(v / 1000)}rb`;
  return rupiah(v);
}

export default function Beranda() {
  const { pengguna } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/api/dashboard').then((r) => setData(r.data)).catch(() => setData({ galat: true }));
  }, []);

  const hariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (!data) {
    return (
      <Wadah>
        <Skeleton className="h-24" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-40" />
        <Skeleton className="h-48" />
      </Wadah>
    );
  }

  const free = data.tier !== 'premium';
  const penuh = free && data.jumlah_hewan >= (data.batas_hewan ?? 2);

  return (
    <Wadah>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-meong-ink">
          Hai, {pengguna?.nama?.split(' ')[0] || 'Kak'} 👋
        </h1>
        <p className="subjudul-halaman capitalize">{hariIni}</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <Card className="p-3.5 text-center">
          <span className="mx-auto mb-1.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-meong-peachSoft text-meong-primaryDark">
            <Cat size={19} />
          </span>
          <p className="font-display text-xl font-semibold leading-none">{data.jumlah_hewan}</p>
          <p className="mt-1 text-[11px] font-bold text-meong-muted">
            Hewan {free ? `/ ${data.batas_hewan ?? 2}` : '• bebas'}
          </p>
        </Card>
        <Card className="p-3.5 text-center">
          <span className="mx-auto mb-1.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-meong-mintSoft text-emerald-700">
            <Wallet size={19} />
          </span>
          <p className="font-display text-xl font-semibold leading-none">{singkatRp(data.pengeluaran_bulan_ini)}</p>
          <p className="mt-1 text-[11px] font-bold text-meong-muted">Bulan ini</p>
        </Card>
        <Card className="p-3.5 text-center">
          <span className="mx-auto mb-1.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-meong-lavenderSoft text-violet-700">
            <BellRing size={19} />
          </span>
          <p className="font-display text-xl font-semibold leading-none">{data.pengingat_aktif}</p>
          <p className="mt-1 text-[11px] font-bold text-meong-muted">
            {data.pengingat_terlambat > 0 ? (
              <span className="text-rose-600">{data.pengingat_terlambat} terlambat</span>
            ) : (
              'Pengingat'
            )}
          </p>
        </Card>
      </div>

      {free && (
        <div className="card flex items-center gap-3 border-meong-sun/60 bg-gradient-to-r from-meong-sunSoft via-meong-peachSoft to-meong-roseSoft p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-amber-700">
            <Sparkles size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-meong-ink">Paket Gratis</p>
            <p className="text-xs text-meong-muted">
              {penuh ? 'Slot hewanmu sudah penuh. ' : ''}Upgrade Premium untuk multi-hewan tanpa batas.
            </p>
          </div>
          <Link to="/pengaturan" className="btn btn-primer shrink-0 px-4 text-xs">
            Lihat
          </Link>
        </div>
      )}

      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-lg font-semibold">Pengingat terdekat</h2>
          <Link to="/pengingat" className="text-xs font-bold text-meong-primaryDark">Semua →</Link>
        </div>
        {data.pengingat_terdekat.length === 0 ? (
          <Card className="flex items-center gap-3 p-4">
            <span className="text-2xl" aria-hidden="true">🎉</span>
            <p className="text-sm text-meong-muted">Aman! Tidak ada pengingat dalam 14 hari ke depan.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {data.pengingat_terdekat.map((r) => {
              const info = jenisInfo(r.jenis);
              const l = labelJadwal(r.tanggal_str);
              return (
                <Link key={r.id} to="/pengingat" className="card card-hover flex items-center gap-3 p-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ backgroundColor: `${info.warna}33` }}>
                    {info.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-meong-ink">{r.judul}</p>
                    <p className="truncate text-xs text-meong-muted">{r.pet_nama} • {info.label}</p>
                  </div>
                  <StatusBadge tone={l.tone}>{l.teks}</StatusBadge>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-lg font-semibold">Hewan kesayangan</h2>
          <Link to="/hewan" className="text-xs font-bold text-meong-primaryDark">Kelola →</Link>
        </div>
        {data.hewan.length === 0 ? (
          <EmptyState
            emoji="🐾"
            title="Belum ada hewan di keluarga"
            subtitle="Yuk, buat profil pertama untuk hewan kesayanganmu! Semua riwayatnya tersimpan rapi di sini."
            action={
              <Link to="/hewan" className="btn-besar btn-primer">
                <Plus size={18} /> Tambah hewan
              </Link>
            }
          />
        ) : (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
            {data.hewan.map((p) => (
              <Link key={p.id} to={`/hewan/${p.id}`} className="card card-hover w-40 shrink-0 p-3">
                <PetAvatar pet={p} ukuran="h-24 w-full" teks="text-4xl" className="rounded-2xl" />
                <p className="mt-2 truncate text-sm font-bold text-meong-ink">{p.nama}</p>
                <p className="truncate text-[11px] text-meong-muted">
                  {p.ras || p.spesies}
                  {p.tanggal_lahir_str || p.tanggal_lahir ? ` • ${umurDari(p.tanggal_lahir_str || p.tanggal_lahir)}` : ''}
                </p>
                <p className="mt-1 text-[11px] font-bold text-meong-primaryDark">
                  {p.berat_badan_kg ? `${Number(p.berat_badan_kg)} kg` : 'Belum ditimbang'}
                </p>
              </Link>
            ))}
            {!penuh && (
              <Link to="/hewan" className="card card-hover flex w-40 shrink-0 flex-col items-center justify-center gap-2 border-dashed border-meong-peach p-3 text-meong-primaryDark">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-meong-peachSoft">
                  <Plus size={20} />
                </span>
                <span className="text-xs font-bold">Tambah hewan</span>
              </Link>
            )}
          </div>
        )}
      </section>
    </Wadah>
  );
}
