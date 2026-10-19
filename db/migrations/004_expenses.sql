-- 004_expenses.sql
-- Pet Expense Tracker: pengeluaran per kategori (makanan, pasir/perlengkapan,
-- medis/vaksin, grooming, lainnya), opsional dikaitkan ke hewan tertentu.

DO $$ BEGIN
  CREATE TYPE kategori_pengeluaran AS ENUM ('makanan', 'pasir_perlengkapan', 'medis_vaksin', 'grooming', 'lainnya');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  kategori kategori_pengeluaran NOT NULL DEFAULT 'lainnya',
  keterangan VARCHAR(200) NOT NULL DEFAULT '',
  jumlah NUMERIC(12,2) NOT NULL CHECK (jumlah > 0),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_tanggal ON expenses(user_id, tanggal);
