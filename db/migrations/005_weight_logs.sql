-- 005_weight_logs.sql
-- Jurnal tumbuh kembang: catatan berat berkala per hewan untuk grafik tren.
-- pets.berat_badan_kg selalu di-refresh dari log terbaru (lihat route /pets).

CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  berat_kg NUMERIC(5,2) NOT NULL CHECK (berat_kg > 0 AND berat_kg < 200),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  catatan VARCHAR(200) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_logs_pet_tanggal ON weight_logs(pet_id, tanggal);
