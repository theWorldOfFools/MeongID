-- 002_pets.sql
-- Profil hewan terpadu: data dasar, fisik & medis, foto profil,
-- plus token publik untuk Digital Pet Passport (QR Code ID).

DO $$ BEGIN
  CREATE TYPE jenis_kelamin_hewan AS ENUM ('jantan', 'betina');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nama VARCHAR(80) NOT NULL,
  spesies VARCHAR(50) NOT NULL DEFAULT 'Kucing',
  ras VARCHAR(80) NOT NULL DEFAULT '',
  tanggal_lahir DATE,
  jenis_kelamin jenis_kelamin_hewan,
  berat_badan_kg NUMERIC(5,2) CHECK (berat_badan_kg IS NULL OR (berat_badan_kg > 0 AND berat_badan_kg < 200)),
  golongan_darah VARCHAR(10) NOT NULL DEFAULT '',
  alergi TEXT NOT NULL DEFAULT '',
  nomor_cip VARCHAR(60) NOT NULL DEFAULT '',
  catatan_darurat TEXT NOT NULL DEFAULT '',
  foto_url VARCHAR(255),
  token_publik UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pets_user ON pets(user_id);
