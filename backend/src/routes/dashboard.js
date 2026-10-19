const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

// GET /api/dashboard — ringkasan Beranda: hewan, pengeluaran bulan ini,
// dan pengingat terdekat (termasuk yang terlambat).
router.get('/', async (req, res) => {
  const uid = req.user.id;
  const [hewan, paket, pengeluaranBulan, perKategori, pengingat, hitung] = await Promise.all([
    pool.query(
      `SELECT p.id, p.nama, p.spesies, p.ras, p.jenis_kelamin, p.berat_badan_kg, p.foto_url,
              to_char(p.tanggal_lahir, 'YYYY-MM-DD') AS tanggal_lahir_str,
              (SELECT COUNT(*)::int FROM reminders r WHERE r.pet_id=p.id AND r.aktif) AS pengingat_aktif
       FROM pets p WHERE p.user_id=$1 ORDER BY p.created_at ASC`,
      [uid]
    ),
    pool.query('SELECT tier FROM users WHERE id=$1', [uid]),
    pool.query(
      `SELECT COALESCE(SUM(jumlah),0) AS total FROM expenses
       WHERE user_id=$1 AND tanggal >= date_trunc('month', CURRENT_DATE)::date`,
      [uid]
    ),
    pool.query(
      `SELECT kategori, SUM(jumlah) AS total FROM expenses
       WHERE user_id=$1 AND tanggal >= date_trunc('month', CURRENT_DATE)::date
       GROUP BY kategori ORDER BY total DESC`,
      [uid]
    ),
    pool.query(
      `SELECT r.id, r.judul, r.jenis, r.ulang_hari, r.aktif,
              to_char(r.tanggal_jadwal, 'YYYY-MM-DD') AS tanggal_str,
              (r.tanggal_jadwal < CURRENT_DATE) AS terlambat,
              p.id AS pet_id, p.nama AS pet_nama, p.foto_url AS pet_foto
       FROM reminders r JOIN pets p ON p.id = r.pet_id
       WHERE r.user_id=$1 AND r.aktif AND r.tanggal_jadwal <= CURRENT_DATE + INTERVAL '14 days'
       ORDER BY r.tanggal_jadwal ASC LIMIT 8`,
      [uid]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE tanggal_jadwal < CURRENT_DATE)::int AS terlambat
       FROM reminders WHERE user_id=$1 AND aktif`,
      [uid]
    ),
  ]);

  const tier = paket.rows[0]?.tier || 'free';
  res.json({
    jumlah_hewan: hewan.rows.length,
    tier,
    batas_hewan: tier === 'premium' ? null : 2,
    pengeluaran_bulan_ini: Number(pengeluaranBulan.rows[0]?.total || 0),
    pengeluaran_per_kategori: perKategori.rows,
    pengingat_aktif: hitung.rows[0]?.total || 0,
    pengingat_terlambat: hitung.rows[0]?.terlambat || 0,
    pengingat_terdekat: pengingat.rows,
    hewan: hewan.rows,
  });
});

module.exports = router;
