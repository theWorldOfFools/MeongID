/* Upload foto (profil hewan & galeri): simpan ke volume uploads,
 * validasi tipe gambar & ukuran maksimal 5 MB.
 */
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR_UPLOAD = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads');
fs.mkdirSync(DIR_UPLOAD, { recursive: true });

const TIPE_DIIZINKAN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DIR_UPLOAD),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase().slice(0, 10);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const uploader = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!TIPE_DIIZINKAN.includes(file.mimetype)) return cb(new Error('TIPE_FILE'));
    cb(null, true);
  },
});

/** Middleware siap pakai: satu file dengan nama field "foto". */
function uploadFoto(req, res, next) {
  uploader.single('foto')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ pesan: 'Foto terlalu besar. Maksimal 5 MB ya 📷' });
    }
    if (err.message === 'TIPE_FILE') {
      return res.status(400).json({ pesan: 'Format foto harus JPG, PNG, WEBP, atau GIF.' });
    }
    console.error('[upload]', err);
    return res.status(400).json({ pesan: 'Gagal mengunggah foto. Coba lagi ya.' });
  });
}

/** Hapus file upload dengan aman (hanya di dalam folder uploads). */
function hapusFileUpload(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
  const nama = path.basename(fileUrl);
  const full = path.join(DIR_UPLOAD, nama);
  fs.unlink(full, () => {});
}

module.exports = { uploadFoto, hapusFileUpload, DIR_UPLOAD };
