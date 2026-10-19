-- 003_reminders.sql
-- Pengingat pintar: vaksinasi, obat cacing/kutu, grooming, dengan
-- pengulangan berkala (ulang_hari) atau sekali saja (NULL).

DO $$ BEGIN
  CREATE TYPE jenis_reminder AS ENUM ('vaksin', 'obat_cacing', 'obat_kutu', 'grooming', 'lainnya');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  judul VARCHAR(120) NOT NULL,
  jenis jenis_reminder NOT NULL DEFAULT 'lainnya',
  tanggal_jadwal DATE NOT NULL,
  ulang_hari INTEGER CHECK (ulang_hari IS NULL OR (ulang_hari >= 1 AND ulang_hari <= 3650)),
  catatan VARCHAR(300) NOT NULL DEFAULT '',
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  selesai_pada TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_tanggal ON reminders(user_id, tanggal_jadwal);
CREATE INDEX IF NOT EXISTS idx_reminders_pet ON reminders(pet_id);
