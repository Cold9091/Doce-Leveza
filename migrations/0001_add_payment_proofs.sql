CREATE TABLE IF NOT EXISTS payment_proofs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  pathology_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  proof_url TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  admin_notes TEXT,
  approved_by INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT
);
