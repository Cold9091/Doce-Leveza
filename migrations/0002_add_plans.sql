CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pathology_id INTEGER,
  type TEXT NOT NULL CHECK (type IN ('mensal', 'trimestral', 'ilimitado')),
  price INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  whatsapp_url TEXT,
  bonus_content_url TEXT,
  active INTEGER NOT NULL DEFAULT 1
);
--> statement-breakpoint
ALTER TABLE subscriptions ADD COLUMN plan_id INTEGER;
--> statement-breakpoint
ALTER TABLE payment_proofs ADD COLUMN plan_id INTEGER;
--> statement-breakpoint
INSERT INTO plans (pathology_id, type, price, duration_days, active)
SELECT id, 'mensal', COALESCE(price, 0), 30, 1
FROM pathologies
WHERE NOT EXISTS (
  SELECT 1 FROM plans p WHERE p.pathology_id = pathologies.id AND p.type = 'mensal'
);
--> statement-breakpoint
INSERT INTO plans (pathology_id, type, price, duration_days, active)
SELECT id, 'trimestral', COALESCE(price, 0), 90, 1
FROM pathologies
WHERE NOT EXISTS (
  SELECT 1 FROM plans p WHERE p.pathology_id = pathologies.id AND p.type = 'trimestral'
);
--> statement-breakpoint
INSERT INTO plans (pathology_id, type, price, duration_days, active)
SELECT NULL, 'ilimitado', 7500, 365, 1
WHERE NOT EXISTS (
  SELECT 1 FROM plans WHERE pathology_id IS NULL AND type = 'ilimitado'
);