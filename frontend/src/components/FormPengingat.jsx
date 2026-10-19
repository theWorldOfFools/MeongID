import { useMemo, useState } from 'react';
import { pesanError } from '../api/client';
import { JENIS_REMINDER, OPSI_ULANG } from '../data/kategori';
import { Notice } from './ui';

function hariIni() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Form tambah/edit pengingat pintar (dipakai di dalam Modal). */
export default function FormPengingat({ hewanList = [], petId = null, awal, onSimpan, onBatal, labelSimpan = 'Simpan pengingat' }) {
  const [isi, setIsi] = useState({
    pet_id: petId || awal?.pet_id || hewanList[0]?.id || '',
    judul: awal?.judul || '',
    jenis: awal?.jenis || 'vaksin',
    tanggal_jadwal: String(awal?.tanggal_str || awal?.tanggal_jadwal || hariIni()).slice(0, 10),
    ulang_hari: awal ? (awal.ulang_hari ?? '') : '',
    catatan: awal?.catatan || '',
  });
  const [galat, setGalat] = useState('');
  const [kirim, setKirim] = useState(false);
  const ubah = (k) => (e) => setIsi((s) => ({ ...s, [k]: e.target.value }));

  // Nilai pengulangan custom (mis. 14 hari dari data lama) tetap bisa dipilih.
  const opsiUlang = useMemo(() => {
    const dasar = [...OPSI_ULANG];
    const nilaiAwal = isi.ulang_hari === '' ? null : Number(isi.ulang_hari);
    if (nilaiAwal && !dasar.some((o) => o.nilai === nilaiAwal)) {
      dasar.splice(1, 0, { nilai: nilaiAwal, label: `Setiap ${nilaiAwal} hari` });
    }
    return dasar;
  }, [isi.ulang_hari]);

  async function kirimForm(e) {
    e.preventDefault();
    if (!isi.pet_id) {
      setGalat('Pilih hewan dulu ya 🐾');
      return;
    }
    if (!isi.judul.trim()) {
      setGalat('Judul pengingat wajib diisi ya.');
      return;
    }
    setGalat('');
    setKirim(true);
    try {
      await onSimpan({
        pet_id: isi.pet_id,
        judul: isi.judul.trim(),
        jenis: isi.jenis,
        tanggal_jadwal: isi.tanggal_jadwal,
        ulang_hari: isi.ulang_hari === '' ? null : Number(isi.ulang_hari),
        catatan: isi.catatan,
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

      {!petId && (
        <div>
          <label className="label" htmlFor="pet-pengingat">Untuk hewan</label>
          <select id="pet-pengingat" className="input-besar mt-1" value={isi.pet_id} onChange={ubah('pet_id')}>
            {hewanList.map((p) => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label" htmlFor="judul-pengingat">Judul *</label>
        <input id="judul-pengingat" className="input-besar mt-1" placeholder="Mis. Vaksin tahunan (FVRCP)" value={isi.judul} onChange={ubah('judul')} autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="jenis-pengingat">Jenis</label>
          <select id="jenis-pengingat" className="input-besar mt-1" value={isi.jenis} onChange={ubah('jenis')}>
            {JENIS_REMINDER.map((j) => (
              <option key={j.id} value={j.id}>{j.emoji} {j.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="tanggal-pengingat">Tanggal jadwal</label>
          <input id="tanggal-pengingat" type="date" className="input-besar mt-1" value={isi.tanggal_jadwal} onChange={ubah('tanggal_jadwal')} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="ulang-pengingat">Pengulangan</label>
        <select id="ulang-pengingat" className="input-besar mt-1" value={isi.ulang_hari} onChange={ubah('ulang_hari')}>
          {opsiUlang.map((o) => (
            <option key={String(o.nilai)} value={o.nilai}>{o.label}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-meong-muted">Pengingat berkala otomatis maju ke jadwal berikutnya setiap ditandai beres ✨</p>
      </div>

      <div>
        <label className="label" htmlFor="catatan-pengingat">Catatan</label>
        <textarea id="catatan-pengingat" rows={2} className="input mt-1" placeholder="Opsional, mis. bawa kartu vaksin" value={isi.catatan} onChange={ubah('catatan')} />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" className="btn-besar btn-lembut flex-1" onClick={onBatal}>
          Batal
        </button>
        <button type="submit" className="btn-besar btn-primer flex-1" disabled={kirim}>
          {kirim ? 'Menyimpan...' : labelSimpan}
        </button>
      </div>
    </form>
  );
}
