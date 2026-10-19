-- 001_users.sql
-- Akun pet parent MeongID. Tier 'free' dibatasi 2 profil hewan,
-- tier 'premium' tanpa batas (multi-hewan, ekspor laporan, galeri HD).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS citext;

DO $$ BEGIN
  CREATE TYPE tier_pengguna AS ENUM ('free', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  telepon VARCHAR(30) NOT NULL DEFAULT '',
  tier tier_pengguna NOT NULL DEFAULT 'free',
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
