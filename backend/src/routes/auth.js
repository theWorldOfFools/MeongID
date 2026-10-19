const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function pesanValidasi(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ pesan: errors.array()[0].msg });
    return false;
  }
  return true;
}

function buatToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, nama: user.nama, tier: user.tier },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
}

function bentukPengguna(u) {
  return { id: u.id, nama: u.nama, email: u.email, telepon: u.telepon, tier: u.tier };
}

// POST /api/auth/register — daftar akun baru (langsung masuk).
router.post(
  '/register',
  [
    body('nama').trim().isLength({ min: 2, max: 100 }).withMessage('Nama minimal 2 huruf ya.'),
    body('email').isEmail().withMessage('Email tidak valid.'),
    body('password').isLength({ min: 6 }).withMessage('Kata sandi minimal 6 karakter ya.'),
  ],
  async (req, res) => {
    if (!pesanValidasi(req, res)) return;
    const nama = req.body.nama.trim();
    const email = req.body.email.trim().toLowerCase();
    const { rows: ada } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (ada[0]) return res.status(409).json({ pesan: 'Email ini sudah terdaftar. Masuk saja ya 😺' });
    const hash = await bcrypt.hash(req.body.password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (nama, email, password_hash) VALUES ($1, $2, $3)
       RETURNING id, nama, email, telepon, tier`,
      [nama, email, hash]
    );
    const user = rows[0];
    res.status(201).json({ token: buatToken(user), pengguna: bentukPengguna(user) });
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [body('email').isEmail().withMessage('Email tidak valid.'), body('password').notEmpty().withMessage('Kata sandi wajib diisi.')],
  async (req, res) => {
    if (!pesanValidasi(req, res)) return;
    const email = req.body.email.trim().toLowerCase();
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1 AND aktif=TRUE', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ pesan: 'Email atau kata sandi salah.' });
    const cocok = await bcrypt.compare(req.body.password, user.password_hash);
    if (!cocok) return res.status(401).json({ pesan: 'Email atau kata sandi salah.' });
    res.json({ token: buatToken(user), pengguna: bentukPengguna(user) });
  }
);

// GET /api/auth/me — profil + jumlah hewan (untuk info batas paket gratis).
router.get('/me', authRequired, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.nama, u.email, u.telepon, u.tier,
            (SELECT COUNT(*)::int FROM pets p WHERE p.user_id = u.id) AS jumlah_hewan
     FROM users u WHERE u.id=$1`,
    [req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ pesan: 'Akun tidak ditemukan.' });
  res.json(rows[0]);
});

// PUT /api/auth/me — perbarui nama & kontak darurat (telepon tampil di paspor QR).
router.put(
  '/me',
  [
    body('nama').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nama minimal 2 huruf ya.'),
    body('telepon').optional().trim().isLength({ max: 30 }).withMessage('Nomor telepon terlalu panjang.'),
  ],
  authRequired,
  async (req, res) => {
    if (!pesanValidasi(req, res)) return;
    const nama = req.body.nama !== undefined ? String(req.body.nama).trim() : null;
    const telepon = req.body.telepon !== undefined ? String(req.body.telepon).trim() : null;
    const { rows } = await pool.query(
      `UPDATE users SET
         nama = COALESCE($2, nama),
         telepon = COALESCE($3, telepon),
         updated_at = NOW()
       WHERE id=$1
       RETURNING id, nama, email, telepon, tier`,
      [req.user.id, nama, telepon]
    );
    res.json(bentukPengguna(rows[0]));
  }
);

// POST /api/auth/upgrade — SIMULASI paket premium (demo tanpa payment gateway).
router.post('/upgrade', authRequired, async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE users SET tier='premium', updated_at=NOW() WHERE id=$1
     RETURNING id, nama, email, telepon, tier`,
    [req.user.id]
  );
  res.json({ pengguna: bentukPengguna(rows[0]), pesan: 'Yeay! Akun kamu sekarang Premium. Hewan tanpa batas! 🎉' });
});

// POST /api/auth/downgrade — kembali ke paket gratis (untuk uji coba demo).
router.post('/downgrade', authRequired, async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE users SET tier='free', updated_at=NOW() WHERE id=$1
     RETURNING id, nama, email, telepon, tier`,
    [req.user.id]
  );
  res.json({ pengguna: bentukPengguna(rows[0]), pesan: 'Akun kembali ke paket Gratis.' });
});

module.exports = router;
