/* Seed akun demo MeongID (idempoten: lewati kalau email sudah ada).
 * Akun: demo@meong.test / meong123 (bisa diubah lewat env SEED_DEMO_*).
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function seed() {
  const email = process.env.SEED_DEMO_EMAIL || 'demo@meong.test';
  const password = process.env.SEED_DEMO_PASSWORD || 'meong123';
  try {
    const { rows: ada } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (ada[0]) {
      console.log('[seed] akun demo sudah ada, lewati.');
      return;
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows: user } = await pool.query(
      `INSERT INTO users (nama, email, password_hash, telepon)
       VALUES ('Kak Demo', $1, $2, '0812-3456-7890') RETURNING id`,
      [email, hash]
    );
    const uid = user[0].id;

    const { rows: pet } = await pool.query(
      `INSERT INTO pets (user_id, nama, spesies, ras, tanggal_lahir, jenis_kelamin,
                         berat_badan_kg, golongan_darah, alergi, nomor_cip, catatan_darurat)
       VALUES ($1, 'Mochi', 'Kucing', 'Persia', '2023-03-14', 'betina',
               4.20, 'A', 'Alergi seafood & debu rumah', 'MOCHI-001',
               'Gampang panik saat ramai. Bila ketemu, hubungi pemilik dan bawa ke Vet Sehat 24 Jam ya.')
       RETURNING id`,
      [uid]
    );
    const petId = pet[0].id;

    await pool.query(
      `INSERT INTO weight_logs (pet_id, user_id, berat_kg, tanggal, catatan) VALUES
         ($1,$2,3.60, CURRENT_DATE - 150, 'Timbang bulanan'),
         ($1,$2,3.75, CURRENT_DATE - 120, 'Timbang bulanan'),
         ($1,$2,3.90, CURRENT_DATE - 90, 'Setelah ganti pakan'),
         ($1,$2,4.00, CURRENT_DATE - 60, 'Timbang bulanan'),
         ($1,$2,4.10, CURRENT_DATE - 30, 'Timbang bulanan'),
         ($1,$2,4.20, CURRENT_DATE, 'Timbang bulanan')`,
      [petId, uid]
    );

    await pool.query(
      `INSERT INTO reminders (pet_id, user_id, judul, jenis, tanggal_jadwal, ulang_hari, catatan) VALUES
         ($1,$2,'Vaksin tahunan (FVRCP)','vaksin', CURRENT_DATE + 7, 365, 'Jangan lupa bawa kartu vaksin'),
         ($1,$2,'Obat cacing rutin','obat_cacing', CURRENT_DATE - 2, 90, 'Dosis sesuai berat 4.2 kg'),
         ($1,$2,'Grooming & mandi','grooming', CURRENT_DATE + 21, 30, 'Salon kucing dekat rumah'),
         ($1,$2,'Obat kutu & caplak','obat_kutu', CURRENT_DATE + 3, 30, 'Tetes di tengkuk ya')`,
      [petId, uid]
    );

    await pool.query(
      `INSERT INTO expenses (user_id, pet_id, kategori, keterangan, jumlah, tanggal) VALUES
         ($1,$2,'makanan','Royal Canin Persian 2 kg', 285000, CURRENT_DATE - 9),
         ($1,$2,'pasir_perlengkapan','Pasir bentonite 10 L', 95000, CURRENT_DATE - 7),
         ($1,$2,'grooming','Mandi & potong kuku', 85000, CURRENT_DATE - 3),
         ($1,$2,'lainnya','Mainan bola berlonceng', 35000, CURRENT_DATE - 2)`,
      [uid, petId]
    );

    const { rows: pet2 } = await pool.query(
      `INSERT INTO pets (user_id, nama, spesies, ras, tanggal_lahir, jenis_kelamin,
                         berat_badan_kg, golongan_darah, alergi, nomor_cip, catatan_darurat)
       VALUES ($1, 'Oreo', 'Anjing', 'Beagle', '2022-11-02', 'jantan',
               12.50, 'DEA 1.1+', 'Alergi ayam & tungau debu', 'OREO-777',
               'Sangat ramah tapi jago kabur kalau pintu terbuka. Bila ketemu, hubungi pemilik ya.')
       RETURNING id`,
      [uid]
    );
    const oreoId = pet2[0].id;

    await pool.query(
      `INSERT INTO weight_logs (pet_id, user_id, berat_kg, tanggal, catatan) VALUES
         ($1,$2,11.80, CURRENT_DATE - 120, 'Timbang bulanan'),
         ($1,$2,12.00, CURRENT_DATE - 80, 'Timbang bulanan'),
         ($1,$2,12.30, CURRENT_DATE - 40, 'Setelah rutin jalan pagi'),
         ($1,$2,12.50, CURRENT_DATE - 7, 'Timbang bulanan')`,
      [oreoId, uid]
    );

    await pool.query(
      `INSERT INTO reminders (pet_id, user_id, judul, jenis, tanggal_jadwal, ulang_hari, catatan) VALUES
         ($1,$2,'Vaksin rabies tahunan','vaksin', CURRENT_DATE + 30, 365, 'Bawa buku vaksin warna biru'),
         ($1,$2,'Obat kutu & caplak','obat_kutu', CURRENT_DATE + 10, 30, 'Tablet kunyah rasa daging'),
         ($1,$2,'Grooming & mandi','grooming', CURRENT_DATE + 5, 60, 'Pesan slot pagi biar tidak antre')`,
      [oreoId, uid]
    );

    await pool.query(
      `INSERT INTO expenses (user_id, pet_id, kategori, keterangan, jumlah, tanggal) VALUES
         ($1,$2,'makanan','Royal Canin Beagle 3 kg', 260000, CURRENT_DATE - 6),
         ($1,$2,'medis_vaksin','Vaksin rabies + konsultasi dokter', 275000, CURRENT_DATE - 15),
         ($1,$2,'grooming','Mandi & potong kuku', 120000, CURRENT_DATE - 1)`,
      [uid, oreoId]
    );

    console.log(`[seed] akun demo siap: ${email} / ${password}`);
  } catch (e) {
    console.error('[seed] GAGAL', e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) seed();
