const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

const KATEGORI_VALID = ['makanan', 'pasir_perlengkapan', 'medis_vaksin', 'grooming', 'lainnya'];
const isTanggal = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));
const isBulan = (s) => /^\d{4}-\d{2}$/.test(String(s || ''));

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

/** "2026-10" -> { dari: '2026-10-01', sampai: '2026-10-31' } */
function rentangBulan(bulan) {
  const [y, m] = bulan.split('-').map(Number);
  const akhir = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { dari: `${bulan}-01`, sampai: `${bulan}-${String(akhir).padStart(2, '0')}` };
}

function susunFilter(req) {
  const params = [req.user.id];
  const where = ['e.user_id=$1'];
  let dari = isTanggal(req.query.dari) ? req.query.dari : null;
  let sampai = isTanggal(req.query.sampai) ? req.query.sampai : null;
  if (isBulan(req.query.bulan)) {
    const rentang = rentangBulan(req.query.bulan);
    dari = rentang.dari;
    sampai = rentang.sampai;
  }
  if (dari) {
    params.push(dari);
    where.push(`e.tanggal >= $${params.length}`);
  }
  if (sampai) {
    params.push(sampai);
    where.push(`e.tanggal <= $${params.length}`);
  }
  if (KATEGORI_VALID.includes(req.query.kategori)) {
    params.push(req.query.kategori);
    where.push(`e.kategori = $${params.length}`);
  }
  if (req.query.pet_id) {
    params.push(req.query.pet_id);
    where.push(`e.pet_id = $${params.length}`);
  }
  return { params, where };
}

// GET /api/expenses?bulan=YYYY-MM | ?dari=&sampai=&kategori=&pet_id=
// Balikan: daftar + total + rekapitulasi per kategori.
router.get('/', async (req, res) => {
  const { params, where } = susunFilter(req);
  const sqlWhere = 'WHERE ' + where.join(' AND ');
  const [daftar, perKategori] = await Promise.all([
    pool.query(
      `SELECT e.*, to_char(e.tanggal, 'YYYY-MM-DD') AS tanggal_str, p.nama AS pet_nama
       FROM expenses e LEFT JOIN pets p ON p.id = e.pet_id
       ${sqlWhere}
       ORDER BY e.tanggal DESC, e.created_at DESC LIMIT 500`,
      params
    ),
    pool.query(
      `SELECT e.kategori, SUM(e.jumlah) AS total, COUNT(*)::int AS jumlah
       FROM expenses e ${sqlWhere}
       GROUP BY e.kategori ORDER BY total DESC`,
      params
    ),
  ]);
  const total = daftar.rows.reduce((s, r) => s + Number(r.jumlah || 0), 0);
  res.json({ total, per_kategori: perKategori.rows, pengeluaran: daftar.rows });
});

// POST /api/expenses
router.post(
  '/',
  [
    body('jumlah').isFloat({ gt: 0 }).withMessage('Nominal pengeluaran harus lebih dari 0.'),
    body('tanggal').optional({ values: 'falsy' }).matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Format tanggal tidak valid (YYYY-MM-DD).'),
  ],
  async (req, res) => {
    if (!pesanValidasi(req, res)) return;
    const kategori = KATEGORI_VALID.includes(req.body.kategori) ? req.body.kategori : 'lainnya';
    const jumlah = Number(req.body.jumlah);
    const tanggal = isTanggal(req.body.tanggal) ? req.body.tanggal : null;
    let petId = null;
    if (req.body.pet_id) {
      const { rows } = await pool.query('SELECT id FROM pets WHERE id=$1 AND user_id=$2', [req.body.pet_id, req.user.id]);
      if (!rows[0]) return res.status(404).json({ pesan: 'Hewan tidak ditemukan di keluarga kamu 🐾' });
      petId = rows[0].id;
    }
    const { rows } = await pool.query(
      `INSERT INTO expenses (user_id, pet_id, kategori, keterangan, jumlah, tanggal)
       VALUES ($1,$2,$3,$4,$5,COALESCE($6::date, CURRENT_DATE))
       RETURNING *, to_char(tanggal, 'YYYY-MM-DD') AS tanggal_str`,
      [req.user.id, petId, kategori, bersihkanTeks(req.body.keterangan, 200), jumlah, tanggal]
    );
    res.status(201).json(rows[0]);
  }
);

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  const { rows } = await pool.query('DELETE FROM expenses WHERE id=$1 AND user_id=$2 RETURNING id', [req.params.id, req.user.id]);
  if (!rows[0]) return res.status(404).json({ pesan: 'Catatan pengeluaran tidak ditemukan.' });
  res.json({ pesan: 'Pengeluaran dihapus.' });
});

module.exports = router;
