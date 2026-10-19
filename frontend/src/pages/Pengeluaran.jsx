import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Wallet } from 'lucide-react';
import api, { pesanError, rupiah } from '../api/client';
import { Card, EmptyState, Notice, PageHeader, Skeleton, Wadah } from '../components/ui';
import Modal from '../components/Modal';
import Konfirmasi from '../components/Konfirmasi';
import { KATEGORI_PENGELUARAN, kategoriInfo } from '../data/kategori';
import { tanggalIndo } from '../utils/format';

const BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function kunciBulan(tahun, bulan) {
  return `${tahun}-${String(bulan + 1).padStart(2, '0')}`;
}

export default function Pengeluaran() {
  const sekarang = new Date();
  const [periode, setPeriode] = useState({ tahun: sekarang.getFullYear(), bulan: sekarang.getMonth() });
  const [data, setData] = useState(null);
  const [hewanList, setHewanList] = useState([]);
  const [modal, setModal] = useState(false);
  const [hapusItem, setHapusItem] = useState(null);
  const [pesan, setPesan] = useState('');

  const bulanStr = kunciBulan(periode.tahun, periode.bulan);
  const bulanIniStr = kunciBulan(sekarang.getFullYear(), sekarang.getMonth());

  const muat = useCallback(async () => {
    setData(null);
    try {
      const { data } = await api.get(`/api/expenses?bulan=${bulanStr}`);
      setData(data);
    } catch {
      setData({ total: 0, per_kategori: [], pengeluaran: [] });
    }
  }, [bulanStr]);

  useEffect(() => {
    muat();
  }, [muat]);

  useEffect(() => {
    api.get('/api/pets').then((r) => setHewanList(r.data.hewan)).catch(() => {});
  }, []);

  function geser(delta) {
    setPeriode((p) => {
      const dt = new Date(p.tahun, p.bulan + delta, 1);
      if (dt > sekarang) return p;
      return { tahun: dt.getFullYear(), bulan: dt.getMonth() };
    });
  }

  async function tambah(payload) {
    await api.post('/api/expenses', payload);
    setModal(false);
    setPesan('Pengeluaran tercatat! 💸');
    await muat();
  }

  async function hapus() {
    try {
      await api.delete(`/api/expenses/${hapusItem.id}`);
      setHapusItem(null);
      setPesan('Pengeluaran dihapus.');
      await muat();
    } catch (e) {
      setPesan(pesanError(e));
      setHapusItem(null);
    }
  }

  const maks = Math.max(...(data?.per_kategori || []).map((k) => Number(k.total)), 1);
  const grupTanggal = data
    ? data.pengeluaran.reduce((acc, e) => {
        (acc[e.tanggal_str] = acc[e.tanggal_str] || []).push(e);
        return acc;
      }, {})
    : {};

  return (
    <Wadah>
      <PageHeader
        title="Pengeluaran hewan"
        subtitle="Catat biaya makan, medis, dan grooming biar dompet sehat 💰"
        action={
          <button className="btn-besar btn-primer" onClick={() => setModal(true)}>
            <Plus size={18} /> Catat
          </button>
        }
      />

      {pesan && <Notice>{pesan}</Notice>}

      <div className="flex items-center justify-between gap-2">
        <button className="btn-ikon bg-white shadow-card" onClick={() => geser(-1)} aria-label="Bulan sebelumnya">
          <ChevronLeft size={20} />
        </button>
        <p className="font-display text-lg font-semibold">
          {BULAN_PANJANG[periode.bulan]} {periode.tahun}
        </p>
        <button className="btn-ikon bg-white shadow-card disabled:opacity-40" onClick={() => geser(1)} disabled={bulanStr >= bulanIniStr} aria-label="Bulan berikutnya">
          <ChevronRight size={20} />
        </button>
      </div>

      {!data ? (
        <div className="space-y-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-48" />
        </div>
      ) : (
        <>
          <Card className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-meong-mintSoft text-emerald-700">
                <Wallet size={20} />
              </span>
              <div>
                <p className="text-xs font-bold text-meong-muted">Total {BULAN_PANJANG[periode.bulan]}</p>
                <p className="font-display text-3xl font-semibold text-meong-ink">{rupiah(data.total)}</p>
              </div>
            </div>

            {data.per_kategori.length > 0 && (
              <div className="mt-4 space-y-2.5">
                {data.per_kategori.map((k) => {
                  const info = kategoriInfo(k.kategori);
                  const persen = Math.round((Number(k.total) / maks) * 100);
                  return (
                    <div key={k.kategori}>
                      <div className="mb-1 flex items-center justify-between text-xs font-bold">
                        <span className="text-meong-ink">
                          {info.emoji} {info.label} <span className="font-semibold text-meong-muted">• {k.jumlah}x</span>
                        </span>
                        <span className="text-meong-muted">{rupiah(k.total)}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-meong-cream">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${persen}%`, backgroundColor: info.warna }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {data.pengeluaran.length === 0 ? (
            <EmptyState
              emoji="🧾"
              title="Belum ada catatan bulan ini"
              subtitle="Mulai catat pengeluaran pertama — nanti bisa lihat rekapitulasi per kategori."
              action={
                <button className="btn-besar btn-primer" onClick={() => setModal(true)}>
                  <Plus size={18} /> Catat pengeluaran
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {Object.entries(grupTanggal).map(([tanggal, items]) => (
                <section key={tanggal} className="space-y-2">
                  <h2 className="px-1 text-xs font-bold uppercase tracking-wide text-meong-muted">{tanggalIndo(tanggal, { panjang: true })}</h2>
                  {items.map((e) => {
                    const info = kategoriInfo(e.kategori);
                    return (
                      <Card key={e.id} className="flex items-center gap-3 p-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ backgroundColor: `${info.warna}33` }}>
                          {info.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-meong-ink">{e.keterangan || info.label}</p>
                          <p className="truncate text-xs text-meong-muted">
                            {info.label}
                            {e.pet_nama ? ` • ${e.pet_nama}` : ''}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-extrabold text-meong-primaryDark">-{rupiah(e.jumlah)}</p>
                        <button className="btn-ikon h-10 w-10 bg-white text-rose-500 hover:bg-rose-50" onClick={() => setHapusItem(e)} aria-label="Hapus pengeluaran">
                          <Trash2 size={15} />
                        </button>
                      </Card>
                    );
                  })}
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <Modal buka={modal} onTutup={() => setModal(false)} judul="Catat pengeluaran 💸">
        <FormPengeluaran hewanList={hewanList} onSimpan={tambah} onBatal={() => setModal(false)} />
      </Modal>

      <Konfirmasi
        buka={!!hapusItem}
        judul="Hapus pengeluaran?"
        pesan={`Catatan "${hapusItem?.keterangan || kategoriInfo(hapusItem?.kategori).label}" akan dihapus.`}
        onYa={hapus}
        onBatal={() => setHapusItem(null)}
      />
    </Wadah>
  );
}

function FormPengeluaran({ hewanList, onSimpan, onBatal }) {
  const sekarang = new Date();
  const [isi, setIsi] = useState({
    kategori: 'makanan',
    jumlah: '',
    tanggal: `${sekarang.getFullYear()}-${String(sekarang.getMonth() + 1).padStart(2, '0')}-${String(sekarang.getDate()).padStart(2, '0')}`,
    pet_id: '',
    keterangan: '',
  });
  const [galat, setGalat] = useState('');
  const [kirim, setKirim] = useState(false);
  const ubah = (k) => (e) => setIsi((s) => ({ ...s, [k]: e.target.value }));

  async function kirimForm(e) {
    e.preventDefault();
    if (!isi.jumlah || Number(isi.jumlah) <= 0) {
      setGalat('Nominalnya diisi dulu ya, minimal Rp1.');
      return;
    }
    setGalat('');
    setKirim(true);
    try {
      await onSimpan({
        kategori: isi.kategori,
        jumlah: Number(isi.jumlah),
        tanggal: isi.tanggal,
        pet_id: isi.pet_id || null,
        keterangan: isi.keterangan,
      });
    } catch (err) {
      setGalat(pesanError(err));
    } finally {
      setKirim(false);
    }
  }

  return (
    <form onSubmit={kirimForm} className="space-y-4">
      {galat && <Notice tone="error">{galat}</Notice>}

      <div>
        <span className="label">Kategori</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {KATEGORI_PENGELUARAN.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setIsi((s) => ({ ...s, kategori: k.id }))}
              className={`min-h-[44px] rounded-2xl border px-3.5 text-[13px] font-bold transition-all ${
                isi.kategori === k.id ? 'border-meong-primary bg-meong-peachSoft text-meong-primaryDark' : 'border-meong-line bg-white text-meong-muted'
              }`}
              aria-pressed={isi.kategori === k.id}
            >
              {k.emoji} {k.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="jumlah-keluar">Nominal (Rp)</label>
          <input id="jumlah-keluar" type="number" min="1" className="input-besar mt-1" placeholder="Mis. 95000" value={isi.jumlah} onChange={ubah('jumlah')} autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="tanggal-keluar">Tanggal</label>
          <input id="tanggal-keluar" type="date" className="input-besar mt-1" value={isi.tanggal} onChange={ubah('tanggal')} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="pet-keluar">Untuk hewan (opsional)</label>
        <select id="pet-keluar" className="input-besar mt-1" value={isi.pet_id} onChange={ubah('pet_id')}>
          <option value="">Semua / umum</option>
          {hewanList.map((p) => (
            <option key={p.id} value={p.id}>{p.nama}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="ket-keluar">Keterangan</label>
        <input id="ket-keluar" className="input-besar mt-1" placeholder="Mis. Royal Canin 2 kg" value={isi.keterangan} onChange={ubah('keterangan')} />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" className="btn-besar btn-lembut flex-1" onClick={onBatal}>
          Batal
        </button>
        <button type="submit" className="btn-besar btn-primer flex-1" disabled={kirim}>
          {kirim ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
