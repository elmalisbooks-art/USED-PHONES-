CREATE TABLE IF NOT EXISTS phones (
  id BIGSERIAL PRIMARY KEY,
  brand VARCHAR(80) NOT NULL,
  model VARCHAR(120) NOT NULL,
  price_ksh NUMERIC(12,2) NOT NULL CHECK (price_ksh > 0),
  condition VARCHAR(40) NOT NULL DEFAULT 'Used',
  storage VARCHAR(40),
  location VARCHAR(120),
  seller_name VARCHAR(120),
  whatsapp VARCHAR(40),
  description TEXT,
  photo_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS phones_created_at_idx ON phones (created_at DESC);
CREATE INDEX IF NOT EXISTS phones_brand_idx ON phones (brand);
