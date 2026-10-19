-- 006_gallery_photos.sql
-- Galeri tumbuh kembang: foto per hewan (file fisik di volume uploads,
-- hanya URL-nya yang disimpan di sini).

CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url VARCHAR(255) NOT NULL,
  keterangan VARCHAR(200) NOT NULL DEFAULT '',
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_pet ON gallery_photos(pet_id);
