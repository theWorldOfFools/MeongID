import { useState } from 'react';
import { pesanError } from '../api/client';
import { SPESIES } from '../data/kategori';
import { Notice } from './ui';

const KOSONG = {
  nama: '',
  spesies: 'Kucing',
  ras: '',
  tanggal_lahir: '',
  jenis_kelamin: '',
  golongan_darah: '',
  alergi: '',
  nomor_cip: '',
  catatan_darurat: '',
  berat_badan_kg: '',
};

/** Form tambah/edit profil hewan (dipakai di dalam Modal). */
export default function FormHewan({ awal, onSimpan, onBatal, labelSimpan = 'Simpan' }) {
  const [isi, setIsi] = useState(
    awal
      ? {
          ...KOSONG,
          nama: awal.nama || '',
          spesies: awal.spesies || 'Kucing',
          ras: awal.ras || '',
          tanggal_lahir: String(awal.tanggal_lahir_str || awal.tanggal_lahir || '').slice(0, 10),
          jenis_kelamin: awal.jenis_kelamin || '',
          golongan_darah: awal.golongan_darah || '',
          alergi: awal.alergi || '',
          nomor_cip: awal.nomor_cip || '',
          catatan_darurat: awal.catatan_darurat || '',
        }
      : KOSONG
  );
  const [galat, setGalat] = useState('');
  const [kirim, setKirim] = useState(false);
  const ubah = (k) => (e) => setIsi((s) => ({ ...s, [k]: e.target.value }));

  async function kirimForm(e) {
    e.preventDefault();
    if (!isi.nama.trim()) {
      setGalat('Nama hewan wajib diisi ya 🐾');
      return;
    }
    setGalat('');
    setKirim(true);
    try {
      const payload = { ...isi };
      if (!payload.berat_badan_kg) delete payload.berat_badan_kg;
      await onSimpan(payload);
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
        <label className="label" htmlFor="nama-hewan">Nama panggilan *</label>
        <input id="nama-hewan" className="input-besar mt-1" placeholder="Mis. Mochi" value={isi.nama} onChange={ubah('nama')} autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="spesies-hewan">Spesies</label>
          <select id="spesies-hewan" className="input-besar mt-1" value={isi.spesies} onChange={ubah('spesies')}>
            {SPESIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="ras-hewan">Ras / jenis</label>
          <input id="ras-hewan" className="input-besar mt-1" placeholder="Mis. Persia" value={isi.ras} onChange={ubah('ras')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="lahir-hewan">Tanggal lahir</label>
          <input id="lahir-hewan" type="date" className="input-besar mt-1" value={isi.tanggal_lahir} onChange={ubah('tanggal_lahir')} />
        </div>
        <div>
          <label className="label" htmlFor="kelamin-hewan">Jenis kelamin</label>
          <select id="kelamin-hewan" className="input-besar mt-1" value={isi.jenis_kelamin} onChange={ubah('jenis_kelamin')}>
            <option value="">Belum tahu</option>
            <option value="jantan">Jantan</option>
            <option value="betina">Betina</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="goldar-hewan">Golongan darah</label>
          <input id="goldar-hewan" className="input-besar mt-1" placeholder="Mis. A / DEA 1+" value={isi.golongan_darah} onChange={ubah('golongan_darah')} />
        </div>
        <div>
          <label className="label" htmlFor="cip-hewan">Nomor cip / stambuk</label>
          <input id="cip-hewan" className="input-besar mt-1" placeholder="Opsional" value={isi.nomor_cip} onChange={ubah('nomor_cip')} />
        </div>
      </div>

      {!awal && (
        <div>
          <label className="label" htmlFor="berat-hewan">Berat awal (kg)</label>
          <input id="berat-hewan" type="number" step="0.01" min="0" className="input-besar mt-1" placeholder="Mis. 3.5" value={isi.berat_badan_kg} onChange={ubah('berat_badan_kg')} />
        </div>
      )}

      <div>
        <label className="label" htmlFor="alergi-hewan">Riwayat alergi</label>
        <textarea id="alergi-hewan" rows={2} className="input mt-1" placeholder="Mis. alergi seafood & debu" value={isi.alergi} onChange={ubah('alergi')} />
      </div>

      <div>
        <label className="label" htmlFor="darurat-hewan">Catatan darurat (tampil di paspor QR)</label>
        <textarea id="darurat-hewan" rows={2} className="input mt-1" placeholder="Mis. gampang panik, hubungi dokter langganan..." value={isi.catatan_darurat} onChange={ubah('catatan_darurat')} />
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
