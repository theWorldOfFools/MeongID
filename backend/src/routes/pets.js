const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');
const { uploadFoto, hapusFileUpload } = require('../middleware/upload');

const router = express.Router();
router.use(authRequired);

// Batas paket gratis sesuai strategi freemium MeongID.
const BATAS_HEWAN_FREE = 2;

const isTanggal = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));

function pesanValidasi(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ pesan: errors.array()[0].msg });
    return false;
  }
  return true;
}

function bersihkanTeks(v, maks) {
  return String(v === undefined || v === null ? '' : v).trim().slice(0, maks);
}

function normalTanggal(v) {
  return isTanggal(v) ? v : null;
}

/** Ambil hewan milik user yang sedang login (404 kalau bukan miliknya). */
async function ambilPetMilik(req, res) {
  const { rows } = await pool.query('SELECT * FROM pets WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  if (!rows[0]) {
    res.status(404).json({ pesan: 'Hewan tidak ditemukan di keluarga kamu 🐾' });
    return null;
  }
  return rows[0];
}

/** Refresh pets.berat_badan_kg dari log berat terbaru. */
async function refreshBeratPet(petId) {
  await pool.query(
    `UPDATE pets SET berat_badan_kg = (
       SELECT berat_kg FROM weight_logs
       WHERE pet_id=$1 ORDER BY tanggal DESC, created_at DESC LIMIT 1
     ), updated_at=NOW() WHERE id=$1`,
    [petId]
  );
}

// GET /api/pets — semua hewan milik user + ringkasan kecil.
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.*,
       (SELECT COUNT(*)::int FROM reminders r WHERE r.pet_id = p.id AND r.aktif AND r.tanggal_jadwal >= CURRENT_DATE) AS pengingat_aktif,
       (SELECT COUNT(*)::int FROM gallery_photos g WHERE g.pet_id = p.id) AS jumlah_foto
     FROM pets p
     WHERE p.user_id=$1
     ORDER BY p.created_at ASC`,
    [req.user.id]
  );
  const { rows: paket } = await pool.query('SELECT tier FROM users WHERE id=$1', [req.user.id]);
  res.json({
    hewan: rows,
    tier: paket[0]?.tier || 'free',
    batas_hewan: paket[0]?.tier === 'premium' ? null : BATAS_HEWAN_FREE,
  });
});

// POST /api/pets — tambah hewan (paket gratis maksimal 2).
router.post(
  '/',
  [body('nama').trim().notEmpty().withMessage('Nama hewan wajib diisi ya.').isLength({ max: 80 }).withMessage('Nama hewan terlalu panjang.')],
  async (req, res) => {
    if (!pesanValidasi(req, res)) return;
    const { rows: user } = await pool.query(
      `SELECT u.tier, (SELECT COUNT(*)::int FROM pets p WHERE p.user_id=u.id) AS jumlah
       FROM users u WHERE u.id=$1`,
      [req.user.id]
    );
    if (user[0]?.tier === 'free' && user[0].jumlah >= BATAS_HEWAN_FREE) {
      return res.status(403).json({
        pesan: `Paket Gratis maksimal ${BATAS_HEWAN_FREE} hewan. Upgrade ke Premium untuk hewan tanpa batas 🐾`,
        kode: 'BATAS_FREE',
      });
    }
    const nama = req.body.nama.trim();
    const spesies = bersihkanTeks(req.body.spesies, 50) || 'Kucing';
    const ras = bersihkanTeks(req.body.ras, 80);
    const tanggalLahir = normalTanggal(req.body.tanggal_lahir);
    const jenisKelamin = ['jantan', 'betina'].includes(req.body.jenis_kelamin) ? req.body.jenis_kelamin : null;
    const golonganDarah = bersihkanTeks(req.body.golongan_darah, 10);
    const alergi = bersihkanTeks(req.body.alergi, 1000);
    const nomorCip = bersihkanTeks(req.body.nomor_cip, 60);
    const catatanDarurat = bersihkanTeks(req.body.catatan_darurat, 1000);
    const berat = Number(req.body.berat_badan_kg);
    const beratValid = Number.isFinite(berat) && berat > 0 && berat < 200 ? berat : null;

    const { rows } = await pool.query(
      `INSERT INTO pets (user_id, nama, spesies, ras, tanggal_lahir, jenis_kelamin,
                         berat_badan_kg, golongan_darah, alergi, nomor_cip, catatan_darurat)
       VALUES ($1,$2,$3,$4,$5::date,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [req.user.id, nama, spesies, ras, tanggalLahir, jenisKelamin, beratValid, golonganDarah, alergi, nomorCip, catatanDarurat]
    );
    if (beratValid) {
      await pool.query(
        `INSERT INTO weight_logs (pet_id, user_id, berat_kg, tanggal, catatan)
         VALUES ($1,$2,$3,CURRENT_DATE,'Berat awal')`,
        [rows[0].id, req.user.id, beratValid]
      );
    }
    res.status(201).json(rows[0]);
  }
);

// GET /api/pets/:id — detail satu hewan.
router.get('/:id', async (req, res) => {
  const pet = await ambilPetMilik(req, res);
  if (!pet) return;
  res.json(pet);
});

// PUT /api/pets/:id — perbarui profil hewan.
router.put('/:id', async (req, res) => {
  const pet = await ambilPetMilik(req, res);
  if (!pet) return;
  const nama = req.body.nama !== undefined ? bersihkanTeks(req.body.nama, 80) : pet.nama;
  if (!nama) return res.status(400).json({ pesan: 'Nama hewan wajib diisi ya.' });
  const spesies = req.body.spesies !== undefined ? bersihkanTeks(req.body.spesies, 50) || 'Kucing' : pet.spesies;
  const ras = req.body.ras !== undefined ? bersihkanTeks(req.body.ras, 80) : pet.ras;
  const tanggalLahir = req.body.tanggal_lahir !== undefined ? normalTanggal(req.body.tanggal_lahir) : pet.tanggal_lahir;
  const jenisKelamin = req.body.jenis_kelamin !== undefined
    ? (['jantan', 'betina'].includes(req.body.jenis_kelamin) ? req.body.jenis_kelamin : null)
    : pet.jenis_kelamin;
  const golonganDarah = req.body.golongan_darah !== undefined ? bersihkanTeks(req.body.golongan_darah, 10) : pet.golongan_darah;
  const alergi = req.body.alergi !== undefined ? bersihkanTeks(req.body.alergi, 1000) : pet.alergi;
  const nomorCip = req.body.nomor_cip !== undefined ? bersihkanTeks(req.body.nomor_cip, 60) : pet.nomor_cip;
  const catatanDarurat = req.body.catatan_darurat !== undefined ? bersihkanTeks(req.body.catatan_darurat, 1000) : pet.catatan_darurat;

  const { rows } = await pool.query(
    `UPDATE pets SET nama=$2, spesies=$3, ras=$4, tanggal_lahir=$5::date, jenis_kelamin=$6,
       golongan_darah=$7, alergi=$8, nomor_cip=$9, catatan_darurat=$10, updated_at=NOW()
     WHERE id=$1 RETURNING *`,
    [pet.id, nama, spesies, ras, tanggalLahir, jenisKelamin, golonganDarah, alergi, nomorCip, catatanDarurat]
  );
  res.json(rows[0]);
});

// DELETE /api/pets/:id — hapus hewan + seluruh foto fisiknya.
router.delete('/:id', async (req, res) => {
  const pet = await ambilPetMilik(req, res);
  if (!pet) return;
  const { rows: fotoGaleri } = await pool.query('SELECT file_url FROM gallery_photos WHERE pet_id=$1', [pet.id]);
  await pool.query('DELETE FROM pets WHERE id=$1', [pet.id]);
  hapusFileUpload(pet.foto_url);
  fotoGaleri.forEach((f) => hapusFileUpload(f.file_url));
  res.json({ pesan: `${pet.nama} sudah dihapus dari keluarga. 🕊️` });
});

// POST /api/pets/:id/foto — unggah/ganti foto profil.
router.post('/:id/foto', uploadFoto, async (req, res) => {
  const pet = await ambilPetMilik(req, res);
  if (!pet) return;
  if (!req.file) return res.status(400).json({ pesan: 'Pilih foto dulu ya.' });
  const urlBaru = `/uploads/${req.file.filename}`;
  await pool.query('UPDATE pets SET foto_url=$2, updated_at=NOW() WHERE id=$1', [pet.id, urlBaru]);
  hapusFileUpload(pet.foto_url);
  res.json({ foto_url: urlBaru, pesan: 'Foto profil berhasil diperbarui 📸' });
});

// ---- Jurnal berat (grafik tumbuh kembang) ----

// GET /api/pets/:id/weights
router.get('/:id/weights', async (req, res) => {
  const pet = await ambilPetMilik(req, res);
  if (!pet) return;
  const { rows } = await pool.query(
    'SELECT * FROM weight_logs WHERE pet_id=$1 ORDER BY tanggal ASC, created_at ASC',
    [pet.id]
  );
  res.json({ log: rows });
});

// POST /api/pets/:id/weights
router.post(
  '/:id/weights',
  [body('berat_kg').isFloat({ gt: 0, lt: 200 }).withMessage('Berat harus antara 0–200 kg ya.')],
  async (req, res) => {
    if (!pesanValidasi(req, res)) return;
    const pet = await ambilPetMilik(req, res);
    if (!pet) return;
    const tanggal = normalTanggal(req.body.tanggal);
    const catatan = bersihkanTeks(req.body.catatan, 200);
    const berat = Number(req.body.berat_kg);
    const { rows } = await pool.query(
      `INSERT INTO weight_logs (pet_id, user_id, berat_kg, tanggal, catatan)
       VALUES ($1,$2,$3,COALESCE($4::date, CURRENT_DATE),$5) RETURNING *`,
      [pet.id, req.user.id, berat, tanggal, catatan]
    );
    await refreshBeratPet(pet.id);
    res.status(201).json(rows[0]);
  }
);

// DELETE /api/pets/:id/weights/:wid
router.delete('/:id/weights/:wid', async (req, res) => {
  const pet = await ambilPetMilik(req, res);
  if (!pet) return;
  const { rowCount } = await pool.query('DELETE FROM weight_logs WHERE id=$1 AND pet_id=$2', [req.params.wid, pet.id]);
  if (!rowCount) return res.status(404).json({ pesan: 'Catatan berat tidak ditemukan.' });
  await refreshBeratPet(pet.id);
  res.json({ pesan: 'Catatan berat dihapus.' });
});

// ---- Galeri tumbuh kembang ----

// GET /api/pets/:id/galeri
router.get('/:id/galeri', async (req, res) => {
  const pet = await ambilPetMilik(req, res);
  if (!pet) return;
  const { rows } = await pool.query(
    'SELECT * FROM gallery_photos WHERE pet_id=$1 ORDER BY tanggal DESC, created_at DESC',
    [pet.id]
  );
  res.json({ foto: rows });
});

// POST /api/pets/:id/galeri
router.post('/:id/galeri', uploadFoto, async (req, res) => {
  const pet = await ambilPetMilik(req, res);
  if (!pet) return;
  if (!req.file) return res.status(400).json({ pesan: 'Pilih foto dulu ya.' });
  const keterangan = bersihkanTeks(req.body.keterangan, 200);
  const tanggal = normalTanggal(req.body.tanggal);
  const url = `/uploads/${req.file.filename}`;
  try {
    const { rows } = await pool.query(
      `INSERT INTO gallery_photos (pet_id, user_id, file_url, keterangan, tanggal)
       VALUES ($1,$2,$3,$4,COALESCE($5::date, CURRENT_DATE)) RETURNING *`,
      [pet.id, req.user.id, url, keterangan, tanggal]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    hapusFileUpload(url);
    throw e;
  }
});

// DELETE /api/pets/:id/galeri/:gid
router.delete('/:id/galeri/:gid', async (req, res) => {
  const pet = await ambilPetMilik(req, res);
  if (!pet) return;
  const { rows } = await pool.query(
    'DELETE FROM gallery_photos WHERE id=$1 AND pet_id=$2 RETURNING file_url',
    [req.params.gid, pet.id]
  );
  if (!rows[0]) return res.status(404).json({ pesan: 'Foto tidak ditemukan.' });
  hapusFileUpload(rows[0].file_url);
  res.json({ pesan: 'Foto dihapus dari galeri.' });
});

module.exports = router;
