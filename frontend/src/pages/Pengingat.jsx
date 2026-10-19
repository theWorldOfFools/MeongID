import { useCallback, useEffect, useState } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import api, { pesanError } from '../api/client';
import { Card, EmptyState, Notice, PageHeader, Skeleton, StatusBadge, Wadah } from '../components/ui';
import Modal from '../components/Modal';
import Konfirmasi from '../components/Konfirmasi';
import FormPengingat from '../components/FormPengingat';
import PetAvatar from '../components/PetAvatar';
import { jenisInfo } from '../data/kategori';
import { labelJadwal, labelUlang, tanggalIndo } from '../utils/format';

function kelompokkan(list) {
  const grup = { Terlambat: [], 'Hari ini': [], '7 hari ke depan': [], Nanti: [] };
  list.forEach((r) => {
    const l = labelJadwal(r.tanggal_str);
    if (l.teks.startsWith('Terlambat')) grup.Terlambat.push(r);
    else if (l.teks === 'Hari ini') grup['Hari ini'].push(r);
    else if (l.teks === 'Besok' || l.teks.startsWith('H-')) {
      const n = l.teks === 'Besok' ? 1 : Number(l.teks.slice(2));
      if (n <= 7) grup['7 hari ke depan'].push(r);
      else grup.Nanti.push(r);
    } else grup.Nanti.push(r);
  });
  return Object.entries(grup).filter(([, arr]) => arr.length > 0);
}

export default function Pengingat() {
  const [status, setStatus] = useState('mendatang');
  const [list, setList] = useState(null);
  const [hewanList, setHewanList] = useState([]);
  const [modal, setModal] = useState(null); // { awal } | { baru: true }
  const [hapusItem, setHapusItem] = useState(null);
  const [pesan, setPesan] = useState('');

  const muat = useCallback(async (st = status) => {
    setList(null);
    try {
      const { data } = await api.get(`/api/reminders?status=${st}`);
      setList(data.pengingat);
    } catch {
      setList([]);
    }
  }, [status]);

  useEffect(() => {
    muat(status);
  }, [status, muat]);

  useEffect(() => {
    api.get('/api/pets').then((r) => setHewanList(r.data.hewan)).catch(() => {});
  }, []);

  async function simpan(payload) {
    if (modal?.awal) {
      await api.put(`/api/reminders/${modal.awal.id}`, payload);
      setPesan('Pengingat diperbarui ✨');
    } else {
      await api.post('/api/reminders', payload);
      setPesan('Pengingat baru ditambahkan 🔔');
    }
    setModal(null);
    await muat();
  }

  async function beres(r) {
    try {
      const { data } = await api.post(`/api/reminders/${r.id}/selesai`);
      setPesan(data.pesan);
      await muat();
    } catch (e) {
      setPesan(pesanError(e));
    }
  }

  async function hapus() {
    try {
      await api.delete(`/api/reminders/${hapusItem.id}`);
      setHapusItem(null);
      setPesan('Pengingat dihapus.');
      await muat();
    } catch (e) {
      setPesan(pesanError(e));
      setHapusItem(null);
    }
  }

  const grup = list ? kelompokkan(list) : [];

  return (
    <Wadah>
      <PageHeader
        title="Pengingat pintar"
        subtitle="Jadwal vaksin, obat, dan grooming biar nggak kelewat 🔔"
        action={
          <button className="btn-besar btn-primer" onClick={() => setModal({ baru: true })} disabled={hewanList.length === 0}>
            <Plus size={18} /> Tambah
          </button>
        }
      />

      {pesan && <Notice>{pesan}</Notice>}

      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-meong-peachSoft p-1" role="tablist">
        {[
          { id: 'mendatang', label: 'Akan datang' },
          { id: 'selesai', label: 'Selesai' },
        ].map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={status === t.id}
            onClick={() => setStatus(t.id)}
            className={`min-h-[44px] rounded-xl text-sm font-bold transition-all ${
              status === t.id ? 'bg-white text-meong-primaryDark shadow-card' : 'text-meong-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {hewanList.length === 0 && (
        <Card className="p-4">
          <p className="text-sm text-meong-muted">Tambah profil hewan dulu supaya bisa pasang pengingat ya 🐾</p>
        </Card>
      )}

      {!list ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          emoji={status === 'selesai' ? '🌙' : '🎉'}
          title={status === 'selesai' ? 'Belum ada riwayat selesai' : 'Semua aman, tidak ada pengingat'}
          subtitle={status === 'selesai' ? 'Pengingat yang sudah ditandai beres akan tampil di sini.' : 'Mantap! Tidak ada tugas yang menunggak.'}
        />
      ) : status === 'selesai' ? (
        <div className="space-y-2">
          {list.map((r) => {
            const info = jenisInfo(r.jenis);
            return (
              <Card key={r.id} className="flex items-center gap-3 p-3.5 opacity-90">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ backgroundColor: `${info.warna}33` }}>
                  {info.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-meong-ink">{r.judul}</p>
                  <p className="truncate text-xs text-meong-muted">
                    {r.pet_nama} • beres {r.selesai_pada ? tanggalIndo(String(r.selesai_pada).slice(0, 10)) : ''}
                  </p>
                </div>
                <button className="btn-ikon h-10 w-10 bg-white text-rose-500 hover:bg-rose-50" onClick={() => setHapusItem(r)} aria-label="Hapus dari riwayat">
                  <Trash2 size={15} />
                </button>
              </Card>
            );
          })}
        </div>
      ) : (
        grup.map(([nama, arr]) => (
          <section key={nama} className="space-y-2">
            <h2 className={`px-1 font-display text-base font-semibold ${nama === 'Terlambat' ? 'text-rose-600' : 'text-meong-ink'}`}>
              {nama} <span className="text-xs font-bold text-meong-muted">({arr.length})</span>
            </h2>
            {arr.map((r) => {
              const info = jenisInfo(r.jenis);
              const l = labelJadwal(r.tanggal_str);
              return (
                <Card key={r.id} className="flex items-center gap-3 p-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ backgroundColor: `${info.warna}33` }}>
                    {info.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-meong-ink">{r.judul}</p>
                    <p className="flex items-center gap-1.5 truncate text-xs text-meong-muted">
                      <PetAvatar pet={{ nama: r.pet_nama, foto_url: r.pet_foto }} ukuran="h-5 w-5" teks="text-[11px]" className="rounded-md" />
                      {r.pet_nama} • {tanggalIndo(r.tanggal_str)} • {labelUlang(r.ulang_hari)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge tone={l.tone}>{l.teks}</StatusBadge>
                    <div className="flex gap-1">
                      <button className="btn-ikon h-9 w-9 bg-meong-mintSoft text-emerald-800" onClick={() => beres(r)} aria-label={`Tandai beres ${r.judul}`}>
                        <Check size={15} />
                      </button>
                      <button className="btn-ikon h-9 w-9 bg-white text-meong-muted hover:bg-meong-cream" onClick={() => setModal({ awal: r })} aria-label={`Edit ${r.judul}`}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn-ikon h-9 w-9 bg-white text-rose-500 hover:bg-rose-50" onClick={() => setHapusItem(r)} aria-label={`Hapus ${r.judul}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </section>
        ))
      )}

      <Modal buka={!!modal} onTutup={() => setModal(null)} judul={modal?.awal ? 'Edit pengingat' : 'Pengingat baru 🔔'}>
        {modal && <FormPengingat hewanList={hewanList} awal={modal.awal} onSimpan={simpan} onBatal={() => setModal(null)} />}
      </Modal>

      <Konfirmasi
        buka={!!hapusItem}
        judul="Hapus pengingat?"
        pesan={`"${hapusItem?.judul || ''}" akan dihapus permanen.`}
        onYa={hapus}
        onBatal={() => setHapusItem(null)}
      />
    </Wadah>
  );
}
