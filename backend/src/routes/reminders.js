const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

const JENIS_VALID = ['vaksin', 'obat_cacing', 'obat_kutu', 'grooming', 'lainnya'];
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

/** ulang_hari: null (sekali saja) atau 1..3650 hari. */
function bacaUlangHari(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 3650) return undefined; // penanda tidak valid
  return n;
}

function tambahHari(tanggalStr, jumlah) {
  const [y, m, d] = tanggalStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + jumlah);
  return dt.toISOString().slice(0, 10);
}

async function ambilReminderMilik(req, res) {
  const { rows } = await pool.query(
    `SELECT r.*, to_char(r.tanggal_jadwal, 'YYYY-MM-DD') AS tanggal_str
     FROM reminders r WHERE r.id=$1 AND r.user_id=$2`,
    [req.params.id, req.user.id]
  );
  if (!rows[0]) {
    res.status(404).json({ pesan: 'Pengingat tidak ditemukan.' });
    return null;
  }
  return rows[0];
}

// GET /api/reminders?status=mendatang|selesai|semua&pet_id=
router.get('/', async (req, res) => {
  const status = ['mendatang', 'selesai', 'semua'].includes(req.query.status) ? req.query.status : 'mendatang';
  const params = [req.user.id];
  const where = ['r.user_id=$1'];
  if (status === 'mendatang') where.push('r.aktif=TRUE');
  if (status === 'selesai') where.push('r.aktif=FALSE');
  if (req.query.pet_id) {
    params.push(req.query.pet_id);
    where.push(`r.pet_id=$${params.length}`);
  }
  const urut = status === 'selesai' ? 'r.selesai_pada DESC' : 'r.tanggal_jadwal ASC';
  const batas = status === 'selesai' ? 100 : 200;
  const { rows } = await pool.query(
    `SELECT r.*, to_char(r.tanggal_jadwal, 'YYYY-MM-DD') AS tanggal_str,
            p.nama AS pet_nama, p.foto_url AS pet_foto
     FROM reminders r
     JOIN pets p ON p.id = r.pet_id
     WHERE ${where.join(' AND ')}
     ORDER BY ${urut}
     LIMIT ${batas}`,
    params
  );
  res.json({ pengingat: rows });
});

// POST /api/reminders — buat pengingat baru untuk salah satu hewan.
router.post(
  '/',
  [
    body('pet_id').isUUID().withMessage('Pilih hewan dulu ya.'),
    body('judul').trim().notEmpty().withMessage('Judul pengingat wajib diisi.').isLength({ max: 120 }).withMessage('Judul terlalu panjang.'),
    body('tanggal_jadwal').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Tanggal jadwal tidak valid (YYYY-MM-DD).'),
  ],
  async (req, res) => {
    if (!pesanValidasi(req, res)) return;
    const { rows: pet } = await pool.query('SELECT id FROM pets WHERE id=$1 AND user_id=$2', [req.body.pet_id, req.user.id]);
    if (!pet[0]) return res.status(404).json({ pesan: 'Hewan tidak ditemukan di keluarga kamu 🐾' });
    const jenis = JENIS_VALID.includes(req.body.jenis) ? req.body.jenis : 'lainnya';
    const ulangHari = bacaUlangHari(req.body.ulang_hari);
    if (ulangHari === undefined) return res.status(400).json({ pesan: 'Pengulangan harus 1–3650 hari.' });
    const { rows } = await pool.query(
      `INSERT INTO reminders (pet_id, user_id, judul, jenis, tanggal_jadwal, ulang_hari, catatan)
       VALUES ($1,$2,$3,$4,$5::date,$6,$7)
       RETURNING *, to_char(tanggal_jadwal, 'YYYY-MM-DD') AS tanggal_str`,
      [pet[0].id, req.user.id, req.body.judul.trim(), jenis, req.body.tanggal_jadwal, ulangHari, bersihkanTeks(req.body.catatan, 300)]
    );
    res.status(201).json(rows[0]);
  }
);

// PUT /api/reminders/:id — ubah isi pengingat.
router.put('/:id', async (req, res) => {
  const r = await ambilReminderMilik(req, res);
  if (!r) return;
  const judul = req.body.judul !== undefined ? bersihkanTeks(req.body.judul, 120) : r.judul;
  if (!judul) return res.status(400).json({ pesan: 'Judul pengingat wajib diisi.' });
  const jenis = req.body.jenis !== undefined ? (JENIS_VALID.includes(req.body.jenis) ? req.body.jenis : 'lainnya') : r.jenis;
  const tanggal = req.body.tanggal_jadwal !== undefined ? req.body.tanggal_jadwal : r.tanggal_str;
  if (!isTanggal(tanggal)) return res.status(400).json({ pesan: 'Tanggal jadwal tidak valid.' });
  const ulangHari = req.body.ulang_hari !== undefined ? bacaUlangHari(req.body.ulang_hari) : r.ulang_hari;
  if (ulangHari === undefined) return res.status(400).json({ pesan: 'Pengulangan harus 1–3650 hari.' });
  const catatan = req.body.catatan !== undefined ? bersihkanTeks(req.body.catatan, 300) : r.catatan;
  const { rows } = await pool.query(
    `UPDATE reminders SET judul=$2, jenis=$3, tanggal_jadwal=$4::date, ulang_hari=$5, catatan=$6
     WHERE id=$1
     RETURNING *, to_char(tanggal_jadwal, 'YYYY-MM-DD') AS tanggal_str`,
    [r.id, judul, jenis, tanggal, ulangHari, catatan]
  );
  res.json(rows[0]);
});

// POST /api/reminders/:id/selesai — tandai beres.
// Sekali saja: pengingat nonaktif. Berkala: jadwal maju ke siklus berikutnya.
router.post('/:id/selesai', async (req, res) => {
  const r = await ambilReminderMilik(req, res);
  if (!r) return;
  if (r.ulang_hari == null) {
    const { rows } = await pool.query(
      `UPDATE reminders SET aktif=FALSE, selesai_pada=NOW() WHERE id=$1
       RETURNING *, to_char(tanggal_jadwal, 'YYYY-MM-DD') AS tanggal_str`,
      [r.id]
    );
    return res.json({ pengingat: rows[0], pesan: 'Pengingat beres! 🎉' });
  }
  const { rows: tgl } = await pool.query(`SELECT to_char(CURRENT_DATE, 'YYYY-MM-DD') AS hari_ini`);
  const hariIni = tgl[0].hari_ini;
  let berikutnya = tambahHari(r.tanggal_str, r.ulang_hari);
  let putaran = 0;
  while (berikutnya <= hariIni && putaran < 1000) {
    berikutnya = tambahHari(berikutnya, r.ulang_hari);
    putaran += 1;
  }
  const { rows } = await pool.query(
    `UPDATE reminders SET tanggal_jadwal=$2::date, selesai_pada=NOW() WHERE id=$1
     RETURNING *, to_char(tanggal_jadwal, 'YYYY-MM-DD') AS tanggal_str`,
    [r.id, berikutnya]
  );
  res.json({ pengingat: rows[0], pesan: `Beres! Jadwal berikutnya ${berikutnya} 🎉` });
});

// DELETE /api/reminders/:id
router.delete('/:id', async (req, res) => {
  const r = await ambilReminderMilik(req, res);
  if (!r) return;
  await pool.query('DELETE FROM reminders WHERE id=$1', [r.id]);
  res.json({ pesan: 'Pengingat dihapus.' });
});

module.exports = router;
