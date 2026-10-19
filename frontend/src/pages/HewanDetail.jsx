import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Camera, Check, Copy, Pencil, Plus, QrCode, Share2, Trash2 } from 'lucide-react';
import api, { fileUrl, pesanError } from '../api/client';
import { Card, EmptyState, Notice, Skeleton, StatusBadge, Wadah } from '../components/ui';
import Modal from '../components/Modal';
import Konfirmasi from '../components/Konfirmasi';
import FormHewan from '../components/FormHewan';
import FormPengingat from '../components/FormPengingat';
import PetAvatar from '../components/PetAvatar';
import GrafikBerat from '../components/GrafikBerat';
import { jenisInfo } from '../data/kategori';
import { labelJadwal, labelUlang, tanggalIndo, umurDari } from '../utils/format';

const TAB = [
  { id: 'profil', label: 'Profil' },
  { id: 'berat', label: 'Berat' },
  { id: 'galeri', label: 'Galeri' },
  { id: 'pengingat', label: 'Pengingat' },
];

function Baris({ label, nilai, tone }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-[13px] font-bold text-meong-muted">{label}</span>
      <span className={`text-right text-sm font-semibold ${nilai ? tone || 'text-meong-ink' : 'italic text-meong-muted/70'}`}>
        {nilai || 'Belum diisi'}
      </span>
    </div>
  );
}

export default function HewanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [pet, setPet] = useState(null);
  const [weights, setWeights] = useState([]);
  const [galeri, setGaleri] = useState([]);
  const [pengingat, setPengingat] = useState([]);
  const [tab, setTab] = useState('profil');
  const [galat, setGalat] = useState('');
  const [pesan, setPesan] = useState('');
  const [modalEdit, setModalEdit] = useState(false);
  const [modalPengingat, setModalPengingat] = useState(null); // { awal } | { baru: true }
  const [modalPaspor, setModalPaspor] = useState(false);
  const [hapusPet, setHapusPet] = useState(false);
  const [sedangHapus, setSedangHapus] = useState(false);
  const [hapusItem, setHapusItem] = useState(null); // { jenis: 'berat'|'galeri'|'pengingat', item }

  const muat = useCallback(async () => {
    try {
      const [p, w, g, r] = await Promise.all([
        api.get(`/api/pets/${id}`),
        api.get(`/api/pets/${id}/weights`),
        api.get(`/api/pets/${id}/galeri`),
        api.get(`/api/reminders?pet_id=${id}`),
      ]);
      setPet(p.data);
      setWeights(w.data.log);
      setGaleri(g.data.foto);
      setPengingat(r.data.pengingat);
    } catch (e) {
      setGalat(pesanError(e, 'Hewan tidak ditemukan di keluarga kamu 🐾'));
    }
  }, [id]);

  useEffect(() => {
    muat();
  }, [muat]);

  async function unggahFotoProfil(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const fd = new FormData();
    fd.append('foto', file);
    try {
      const { data } = await api.post(`/api/pets/${id}/foto`, fd);
      setPet((s) => ({ ...s, foto_url: data.foto_url }));
      setPesan(data.pesan);
    } catch (err) {
      setPesan(pesanError(err));
    }
  }

  async function simpanEdit(payload) {
    await api.put(`/api/pets/${id}`, payload);
    setModalEdit(false);
    setPesan('Profil diperbarui ✨');
    await muat();
  }

  async function simpanPengingat(payload) {
    if (modalPengingat?.awal) {
      await api.put(`/api/reminders/${modalPengingat.awal.id}`, payload);
      setPesan('Pengingat diperbarui ✨');
    } else {
      await api.post('/api/reminders', payload);
      setPesan('Pengingat baru ditambahkan 🔔');
    }
    setModalPengingat(null);
    await muat();
  }

  async function beresPengingat(r) {
    try {
      const { data } = await api.post(`/api/reminders/${r.id}/selesai`);
      setPesan(data.pesan);
      await muat();
    } catch (e) {
      setPesan(pesanError(e));
    }
  }

  async function jalanHapusItem() {
    const { jenis, item } = hapusItem;
    try {
      if (jenis === 'berat') await api.delete(`/api/pets/${id}/weights/${item.id}`);
      if (jenis === 'galeri') await api.delete(`/api/pets/${id}/galeri/${item.id}`);
      if (jenis === 'pengingat') await api.delete(`/api/reminders/${item.id}`);
      setPesan('Sudah dihapus.');
      setHapusItem(null);
      await muat();
    } catch (e) {
      setPesan(pesanError(e));
      setHapusItem(null);
    }
  }

  async function hapusHewan() {
    setSedangHapus(true);
    try {
      await api.delete(`/api/pets/${id}`);
      navigate('/hewan', { replace: true });
    } catch (e) {
      setPesan(pesanError(e));
      setSedangHapus(false);
      setHapusPet(false);
    }
  }

  if (galat) {
    return (
      <Wadah>
        <Notice tone="error">{galat}</Notice>
        <Link to="/hewan" className="btn-besar btn-lembut">
          <ArrowLeft size={18} /> Kembali ke daftar hewan
        </Link>
      </Wadah>
    );
  }

  if (!pet) {
    return (
      <Wadah>
        <Skeleton className="h-40" />
        <Skeleton className="h-12" />
        <Skeleton className="h-56" />
      </Wadah>
    );
  }

  const umur = umurDari(pet.tanggal_lahir_str || pet.tanggal_lahir);

  return (
    <Wadah>
      <button type="button" onClick={() => navigate('/hewan')} className="flex items-center gap-1.5 text-xs font-bold text-meong-muted hover:text-meong-primaryDark">
        <ArrowLeft size={14} /> Semua hewan
      </button>

      {pesan && <Notice>{pesan}</Notice>}

      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <PetAvatar pet={pet} ukuran="h-24 w-24" teks="text-5xl" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-ikon absolute -bottom-2 -right-2 h-10 w-10 bg-meong-primary text-white shadow-pop"
              aria-label="Ganti foto profil"
            >
              <Camera size={17} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={unggahFotoProfil} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-2xl font-semibold text-meong-ink">{pet.nama}</h1>
            <p className="truncate text-sm text-meong-muted">
              {pet.spesies}
              {pet.ras ? ` • ${pet.ras}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pet.jenis_kelamin && (
                <StatusBadge tone={pet.jenis_kelamin === 'betina' ? 'rose' : 'sky'}>
                  {pet.jenis_kelamin === 'betina' ? '♀ Betina' : '♂ Jantan'}
                </StatusBadge>
              )}
              {umur && <StatusBadge tone="amber">{umur}</StatusBadge>}
              <StatusBadge tone="emerald">{pet.berat_badan_kg ? `${Number(pet.berat_badan_kg)} kg` : 'Belum ditimbang'}</StatusBadge>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button className="btn-besar btn-lembut" onClick={() => setModalPaspor(true)}>
            <QrCode size={17} /> Paspor
          </button>
          <button className="btn-besar btn-lembut" onClick={() => setModalEdit(true)}>
            <Pencil size={17} /> Edit
          </button>
          <button className="btn-besar btn-bahaya-lembut" onClick={() => setHapusPet(true)}>
            <Trash2 size={17} /> Hapus
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-meong-peachSoft p-1" role="tablist" aria-label="Bagian profil hewan">
        {TAB.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-[44px] rounded-xl text-[13px] font-bold transition-all ${
              tab === t.id ? 'bg-white text-meong-primaryDark shadow-card' : 'text-meong-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profil' && (
        <Card className="divide-y divide-meong-line p-4 sm:p-5">
          <Baris label="Tanggal lahir" nilai={pet.tanggal_lahir_str || pet.tanggal_lahir ? `${tanggalIndo(pet.tanggal_lahir_str || pet.tanggal_lahir)}${umur ? ` (${umur})` : ''}` : ''} />
          <Baris label="Jenis kelamin" nilai={pet.jenis_kelamin} />
          <Baris label="Golongan darah" nilai={pet.golongan_darah} />
          <Baris label="Nomor cip / stambuk" nilai={pet.nomor_cip} />
          <Baris label="Riwayat alergi" nilai={pet.alergi} tone="text-rose-600" />
          <Baris label="Catatan darurat" nilai={pet.catatan_darurat} tone="text-amber-700" />
        </Card>
      )}

      {tab === 'berat' && <TabBerat petId={id} weights={weights} muatUlang={muat} setPesan={setPesan} onHapus={(item) => setHapusItem({ jenis: 'berat', item })} />}

      {tab === 'galeri' && <TabGaleri petId={id} galeri={galeri} muatUlang={muat} setPesan={setPesan} onHapus={(item) => setHapusItem({ jenis: 'galeri', item })} />}

      {tab === 'pengingat' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display text-lg font-semibold">Pengingat {pet.nama}</h2>
            <button className="btn btn-primer px-4 text-xs" onClick={() => setModalPengingat({ baru: true })}>
              <Plus size={15} /> Tambah
            </button>
          </div>
          {pengingat.length === 0 ? (
            <EmptyState emoji="🔔" title="Belum ada pengingat" subtitle={`Yuk atur jadwal vaksin, obat, atau grooming ${pet.nama}.`} />
          ) : (
            pengingat.map((r) => {
              const info = jenisInfo(r.jenis);
              const l = labelJadwal(r.tanggal_str);
              return (
                <Card key={r.id} className="flex items-center gap-3 p-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ backgroundColor: `${info.warna}33` }}>
                    {info.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-meong-ink">{r.judul}</p>
                    <p className="truncate text-xs text-meong-muted">
                      {tanggalIndo(r.tanggal_str)} • {labelUlang(r.ulang_hari)}
                    </p>
                  </div>
                  <StatusBadge tone={l.tone}>{l.teks}</StatusBadge>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button className="btn-ikon h-10 w-10 bg-meong-mintSoft text-emerald-800" onClick={() => beresPengingat(r)} aria-label={`Tandai beres ${r.judul}`}>
                      <Check size={17} />
                    </button>
                    <div className="flex gap-1">
                      <button className="btn-ikon h-10 w-10 bg-white text-meong-muted hover:bg-meong-cream" onClick={() => setModalPengingat({ awal: r })} aria-label={`Edit ${r.judul}`}>
                        <Pencil size={15} />
                      </button>
                      <button className="btn-ikon h-10 w-10 bg-white text-rose-500 hover:bg-rose-50" onClick={() => setHapusItem({ jenis: 'pengingat', item: r })} aria-label={`Hapus ${r.judul}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      <Modal buka={modalEdit} onTutup={() => setModalEdit(false)} judul={`Edit profil ${pet.nama}`}>
        <FormHewan awal={pet} onSimpan={simpanEdit} onBatal={() => setModalEdit(false)} labelSimpan="Simpan perubahan" />
      </Modal>

      <Modal buka={!!modalPengingat} onTutup={() => setModalPengingat(null)} judul={modalPengingat?.awal ? 'Edit pengingat' : `Pengingat baru untuk ${pet.nama}`}>
        {modalPengingat && (
          <FormPengingat
            petId={id}
            awal={modalPengingat.awal}
            onSimpan={simpanPengingat}
            onBatal={() => setModalPengingat(null)}
          />
        )}
      </Modal>

      <ModalPaspor buka={modalPaspor} onTutup={() => setModalPaspor(false)} pet={pet} />

      <Konfirmasi
        buka={hapusPet}
        judul={`Hapus ${pet.nama}?`}
        pesan={`Semua data ${pet.nama} (pengingat, pengeluaran, jurnal berat, galeri) ikut terhapus permanen.`}
        onYa={hapusHewan}
        onBatal={() => setHapusPet(false)}
        sedang={sedangHapus}
      />

      <Konfirmasi
        buka={!!hapusItem}
        judul="Hapus data ini?"
        pesan={
          hapusItem?.jenis === 'galeri'
            ? 'Foto akan dihapus permanen dari galeri.'
            : hapusItem?.jenis === 'berat'
              ? 'Catatan berat ini akan dihapus dari grafik.'
              : 'Pengingat ini akan dihapus.'
        }
        onYa={jalanHapusItem}
        onBatal={() => setHapusItem(null)}
      />
    </Wadah>
  );
}

/** Tab: grafik tren berat + form timbang cepat + riwayat. */
function TabBerat({ petId, weights, muatUlang, setPesan, onHapus }) {
  const hariIni = new Date();
  const [isi, setIsi] = useState({
    berat_kg: '',
    tanggal: `${hariIni.getFullYear()}-${String(hariIni.getMonth() + 1).padStart(2, '0')}-${String(hariIni.getDate()).padStart(2, '0')}`,
    catatan: '',
  });
  const [kirim, setKirim] = useState(false);
  const ubah = (k) => (e) => setIsi((s) => ({ ...s, [k]: e.target.value }));

  async function simpan(e) {
    e.preventDefault();
    if (!isi.berat_kg) return setPesan('Isi beratnya dulu ya ⚖️');
    setKirim(true);
    try {
      await api.post(`/api/pets/${petId}/weights`, isi);
      setPesan('Catatan berat tersimpan! 📈');
      setIsi((s) => ({ ...s, berat_kg: '', catatan: '' }));
      await muatUlang();
    } catch (err) {
      setPesan(pesanError(err));
    } finally {
      setKirim(false);
    }
  }

  const urut = [...weights].reverse();

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <GrafikBerat data={weights} />
      </Card>

      <Card className="p-4">
        <h3 className="font-display text-base font-semibold">Timbang sekarang ⚖️</h3>
        <form onSubmit={simpan} className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="berat-baru">Berat (kg)</label>
              <input id="berat-baru" type="number" step="0.01" min="0" className="input-besar mt-1" placeholder="Mis. 4.2" value={isi.berat_kg} onChange={ubah('berat_kg')} />
            </div>
            <div>
              <label className="label" htmlFor="tanggal-berat">Tanggal</label>
              <input id="tanggal-berat" type="date" className="input-besar mt-1" value={isi.tanggal} onChange={ubah('tanggal')} />
            </div>
          </div>
          <input className="input-besar" placeholder="Catatan (opsional), mis. setelah ganti pakan" value={isi.catatan} onChange={ubah('catatan')} />
          <button type="submit" className="btn-besar btn-primer w-full" disabled={kirim}>
            {kirim ? 'Menyimpan...' : 'Simpan berat'}
          </button>
        </form>
      </Card>

      {urut.length > 0 && (
        <Card className="divide-y divide-meong-line p-4">
          <h3 className="pb-3 font-display text-base font-semibold">Riwayat timbangan</h3>
          {urut.map((w, i) => {
            const sebelumnya = urut[i + 1];
            const delta = sebelumnya ? Number((Number(w.berat_kg) - Number(sebelumnya.berat_kg)).toFixed(2)) : null;
            return (
              <div key={w.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-meong-ink">
                    {Number(w.berat_kg)} kg{' '}
                    {delta !== null && delta !== 0 && (
                      <span className={`text-xs font-bold ${delta > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-meong-muted">
                    {tanggalIndo(w.tanggal_str || w.tanggal)}
                    {w.catatan ? ` • ${w.catatan}` : ''}
                  </p>
                </div>
                <button className="btn-ikon h-10 w-10 bg-white text-rose-500 hover:bg-rose-50" onClick={() => onHapus(w)} aria-label="Hapus catatan berat">
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

/** Tab: galeri foto tumbuh kembang. */
function TabGaleri({ petId, galeri, muatUlang, setPesan, onHapus }) {
  const [lihat, setLihat] = useState(null);
  const [kirim, setKirim] = useState(false);

  async function unggah(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setKirim(true);
    const fd = new FormData();
    fd.append('foto', file);
    try {
      await api.post(`/api/pets/${petId}/galeri`, fd);
      setPesan('Foto baru masuk galeri! 📷');
      await muatUlang();
    } catch (err) {
      setPesan(pesanError(err));
    } finally {
      setKirim(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-meong-peach bg-meong-peachSoft/60 text-meong-primaryDark transition hover:bg-meong-peachSoft">
          <Camera size={22} />
          <span className="text-[11px] font-bold">{kirim ? 'Mengunggah...' : 'Tambah foto'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={unggah} disabled={kirim} />
        </label>
        {galeri.map((f) => (
          <button key={f.id} type="button" onClick={() => setLihat(f)} className="group relative aspect-square overflow-hidden rounded-2xl border border-meong-line">
            <img src={fileUrl(f.file_url)} alt={f.keterangan || 'Foto hewan'} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
          </button>
        ))}
      </div>

      {galeri.length === 0 && (
        <EmptyState emoji="📷" title="Galeri masih kosong" subtitle="Abadikan momen tumbuh kembang hewanmu di sini." />
      )}

      <Modal buka={!!lihat} onTutup={() => setLihat(null)} judul="Momen manis 📸">
        {lihat && (
          <div className="space-y-3">
            <img src={fileUrl(lihat.file_url)} alt={lihat.keterangan || 'Foto hewan'} className="w-full rounded-2xl" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-meong-ink">{lihat.keterangan || 'Tanpa keterangan'}</p>
                <p className="text-xs text-meong-muted">{tanggalIndo(lihat.tanggal)}</p>
              </div>
              <button className="btn-besar btn-bahaya-lembut" onClick={() => { onHapus(lihat); setLihat(null); }}>
                <Trash2 size={16} /> Hapus
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/** Modal paspor QR: tautan publik + QR untuk ditempel. */
function ModalPaspor({ buka, onTutup, pet }) {
  const [tersalin, setTersalin] = useState(false);
  const tautan = `${window.location.origin}/passport/${pet.token_publik}`;

  async function salin() {
    try {
      await navigator.clipboard.writeText(tautan);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      /* diabaikan: clipboard tidak tersedia */
    }
  }

  async function bagikan() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Paspor ${pet.nama}`, text: `Paspor digital ${pet.nama} di MeongID`, url: tautan });
        return;
      } catch {
        /* dibatalkan pengguna */
      }
    }
    salin();
  }

  return (
    <Modal buka={buka} onTutup={onTutup} judul={`Paspor digital ${pet.nama} 🐾`}>
      <div className="space-y-4 text-center">
        <div className="mx-auto w-fit rounded-3xl border border-meong-line bg-white p-4 shadow-card">
          <QRCodeSVG value={tautan} size={200} bgColor="#FFFFFF" fgColor="#4A3B35" level="M" marginSize={2} />
        </div>
        <p className="text-sm text-meong-muted">
          Tempel QR ini di kandang atau tas carrier. Siapa pun yang menemukan {pet.nama} bisa melihat kontak darurat & riwayat alerginya tanpa perlu login.
        </p>
        <p className="break-all rounded-2xl bg-meong-cream px-3 py-2 text-[11px] font-semibold text-meong-muted">{tautan}</p>
        <div className="grid grid-cols-3 gap-2">
          <button className="btn-besar btn-lembut" onClick={salin}>
            {tersalin ? <Check size={16} /> : <Copy size={16} />} {tersalin ? 'Tersalin' : 'Salin'}
          </button>
          <button className="btn-besar btn-lembut" onClick={bagikan}>
            <Share2 size={16} /> Bagikan
          </button>
          <a className="btn-besar btn-primer" href={`/passport/${pet.token_publik}`} target="_blank" rel="noreferrer">
            <QrCode size={16} /> Buka
          </a>
        </div>
      </div>
    </Modal>
  );
}
