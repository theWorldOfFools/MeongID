const express = require('express');
const pool = require('../config/db');

const router = express.Router();

const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ''));

// GET /api/passport/:token — HALAMAN PUBLIK (tanpa login).
// Dipindai dari QR Code saat hewan tersesat / dititipkan. Hanya menampilkan
// data penting: identitas hewan, alergi, catatan darurat, dan kontak pemilik.
router.get('/:token', async (req, res) => {
  if (!isUuid(req.params.token)) {
    return res.status(404).json({ pesan: 'Paspor tidak ditemukan. Cek lagi tautannya ya 🐾' });
  }
  const { rows } = await pool.query(
    `SELECT p.id, p.nama, p.spesies, p.ras, p.jenis_kelamin,
            to_char(p.tanggal_lahir, 'YYYY-MM-DD') AS tanggal_lahir_str,
            p.berat_badan_kg, p.golongan_darah, p.alergi, p.nomor_cip,
            p.catatan_darurat, p.foto_url, p.token_publik,
            u.nama AS pemilik_nama, u.telepon AS pemilik_telepon
     FROM pets p JOIN users u ON u.id = p.user_id
     WHERE p.token_publik = $1`,
    [req.params.token]
  );
  const pet = rows[0];
  if (!pet) return res.status(404).json({ pesan: 'Paspor tidak ditemukan. Cek lagi tautannya ya 🐾' });

  const { rows: riwayat } = await pool.query(
    `SELECT judul, to_char(tanggal_jadwal, 'YYYY-MM-DD') AS jadwal,
            to_char(selesai_pada, 'YYYY-MM-DD') AS selesai
     FROM reminders
     WHERE pet_id=$1 AND jenis='vaksin'
     ORDER BY selesai_pada DESC NULLS LAST, tanggal_jadwal DESC LIMIT 6`,
    [pet.id]
  );

  res.json({
    hewan: {
      nama: pet.nama,
      spesies: pet.spesies,
      ras: pet.ras,
      jenis_kelamin: pet.jenis_kelamin,
      tanggal_lahir: pet.tanggal_lahir_str,
      berat_badan_kg: pet.berat_badan_kg,
      golongan_darah: pet.golongan_darah,
      alergi: pet.alergi,
      nomor_cip: pet.nomor_cip,
      catatan_darurat: pet.catatan_darurat,
      foto_url: pet.foto_url,
    },
    kontak_darurat: { nama: pet.pemilik_nama, telepon: pet.pemilik_telepon },
    riwayat_vaksin: riwayat,
  });
});

module.exports = router;
