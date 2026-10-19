import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import api, { pesanError } from '../api/client';
import { Card, EmptyState, Notice, PageHeader, Skeleton, StatusBadge, Wadah } from '../components/ui';
import Modal from '../components/Modal';
import Konfirmasi from '../components/Konfirmasi';
import FormHewan from '../components/FormHewan';
import PetAvatar from '../components/PetAvatar';
import { tanggalIndo, umurDari } from '../utils/format';

export default function Hewan() {
  const [data, setData] = useState(null);
  const [modalTambah, setModalTambah] = useState(false);
  const [editPet, setEditPet] = useState(null);
  const [hapusPet, setHapusPet] = useState(null);
  const [sedangHapus, setSedangHapus] = useState(false);
  const [pesan, setPesan] = useState('');

  async function muat() {
    try {
      const { data } = await api.get('/api/pets');
      setData(data);
    } catch {
      setData({ hewan: [], tier: 'free', batas_hewan: 2, galat: true });
    }
  }

  useEffect(() => {
    muat();
  }, []);

  async function tambah(payload) {
    const { data: baru } = await api.post('/api/pets', payload);
    setModalTambah(false);
    setPesan(`${baru.nama} sudah masuk keluarga! 🐾`);
    await muat();
  }

  async function simpanEdit(payload) {
    await api.put(`/api/pets/${editPet.id}`, payload);
    setEditPet(null);
    setPesan('Profil hewan diperbarui ✨');
    await muat();
  }

  async function hapus() {
    setSedangHapus(true);
    try {
      const { data: hasil } = await api.delete(`/api/pets/${hapusPet.id}`);
      setHapusPet(null);
      setPesan(hasil.pesan);
      await muat();
    } catch (e) {
      setPesan(pesanError(e));
    } finally {
      setSedangHapus(false);
    }
  }

  const free = data && data.tier !== 'premium';
  const penuh = free && data.hewan.length >= (data.batas_hewan ?? 2);

  return (
    <Wadah>
      <PageHeader
        title="Hewan kesayangan"
        subtitle="Semua profil, medis, dan riwayat ada di sini 🐾"
        action={
          <button className="btn-besar btn-primer" onClick={() => setModalTambah(true)} disabled={penuh}>
            <Plus size={18} /> Tambah
          </button>
        }
      />

      {pesan && <Notice>{pesan}</Notice>}

      {penuh && (
        <Card className="border-meong-sun/60 bg-meong-sunSoft/70 p-4">
          <p className="text-sm font-bold text-meong-ink">Slot Paket Gratis sudah penuh (maks {data.batas_hewan ?? 2} hewan)</p>
          <p className="mt-0.5 text-xs text-meong-muted">
            Upgrade ke Premium untuk profil hewan tanpa batas, ekspor laporan, dan galeri resolusi tinggi.
          </p>
          <Link to="/pengaturan" className="btn btn-primer mt-3 px-4 text-xs">
            Coba Premium di Pengaturan →
          </Link>
        </Card>
      )}

      {!data ? (
        <div className="space-y-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : data.hewan.length === 0 ? (
        <EmptyState
          emoji="🐱"
          title="Belum ada profil hewan"
          subtitle="Tambah yang pertama yuk! Isi data dasar, berat, dan kontak darurat — nanti bisa diakses lewat QR paspor."
          action={
            <button className="btn-besar btn-primer" onClick={() => setModalTambah(true)}>
              <Plus size={18} /> Tambah hewan pertama
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.hewan.map((p) => (
            <Card key={p.id} className="flex items-center gap-3 p-3.5">
              <PetAvatar pet={p} ukuran="h-16 w-16" teks="text-3xl" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-lg font-semibold text-meong-ink">{p.nama}</p>
                  {p.jenis_kelamin && <StatusBadge tone={p.jenis_kelamin === 'betina' ? 'rose' : 'sky'}>{p.jenis_kelamin === 'betina' ? '♀' : '♂'}</StatusBadge>}
                </div>
                <p className="truncate text-xs text-meong-muted">
                  {p.spesies}
                  {p.ras ? ` • ${p.ras}` : ''}
                  {p.tanggal_lahir_str || p.tanggal_lahir ? ` • ${umurDari(p.tanggal_lahir_str || p.tanggal_lahir)}` : ''}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-bold text-meong-muted">
                  <span className="text-meong-primaryDark">{p.berat_badan_kg ? `${Number(p.berat_badan_kg)} kg` : 'Belum ditimbang'}</span>
                  <span>🔔 {p.pengingat_aktif} pengingat</span>
                  <span>📷 {p.jumlah_foto} foto</span>
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Link to={`/hewan/${p.id}`} className="btn-ikon bg-meong-peachSoft text-meong-primaryDark" aria-label={`Buka detail ${p.nama}`}>
                  <ChevronRight size={20} />
                </Link>
                <button className="btn-ikon bg-white text-meong-muted hover:bg-meong-cream" onClick={() => setEditPet(p)} aria-label={`Edit ${p.nama}`}>
                  <Pencil size={17} />
                </button>
                <button className="btn-ikon bg-white text-rose-500 hover:bg-rose-50" onClick={() => setHapusPet(p)} aria-label={`Hapus ${p.nama}`}>
                  <Trash2 size={17} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal buka={modalTambah} onTutup={() => setModalTambah(false)} judul="Tambah hewan baru 🐾">
        <FormHewan onSimpan={tambah} onBatal={() => setModalTambah(false)} labelSimpan="Tambah ke keluarga" />
      </Modal>

      <Modal buka={!!editPet} onTutup={() => setEditPet(null)} judul={`Edit profil ${editPet?.nama || ''}`}>
        {editPet && <FormHewan awal={editPet} onSimpan={simpanEdit} onBatal={() => setEditPet(null)} labelSimpan="Simpan perubahan" />}
      </Modal>

      <Konfirmasi
        buka={!!hapusPet}
        judul={`Hapus ${hapusPet?.nama || 'hewan'}?`}
        pesan={`Semua data ${hapusPet?.nama || ''} (pengingat, pengeluaran, jurnal berat, dan galeri) ikut terhapus permanen.`}
        onYa={hapus}
        onBatal={() => setHapusPet(null)}
        sedang={sedangHapus}
      />
    </Wadah>
  );
}
