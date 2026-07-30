-- MK Tips — Security Hardening (idempotente / ignora tabelas ausentes)

-- 0) Criar user_credentials se não existir (necessária para login seguro)
CREATE TABLE IF NOT EXISTS user_credentials (
  email TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  user_id UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY,
  user_id UUID,
  email TEXT,
  amount NUMERIC,
  plan TEXT,
  product_type TEXT,
  transaction_id TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'user_credentials',
    'payments',
    'community_contacts',
    'logs',
    'audit_logs',
    'users',
    'tips',
    'tipsters',
    'tickets',
    'bankroll_logs',
    'favorites',
    'referrals',
    'coupons',
    'challenge_stages'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'public_all', t);
    END IF;
  END LOOP;
END $$;

-- Users: SELECT legado aberto; writes só service role
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users') THEN
    DROP POLICY IF EXISTS "users_anon_select" ON users;
    CREATE POLICY "users_anon_select" ON users FOR SELECT USING (true);
  END IF;
END $$;

-- Tips: SELECT público
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tips') THEN
    DROP POLICY IF EXISTS "tips_anon_select" ON tips;
    CREATE POLICY "tips_anon_select" ON tips FOR SELECT USING (true);
  END IF;
END $$;

-- Tipsters: SELECT público
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tipsters') THEN
    DROP POLICY IF EXISTS "tipsters_anon_select" ON tipsters;
    CREATE POLICY "tipsters_anon_select" ON tipsters FOR SELECT USING (true);
  END IF;
END $$;

-- Demais: SELECT legado (sem write anon)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tickets', 'bankroll_logs', 'favorites', 'referrals', 'coupons', 'challenge_stages'
  ] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_anon_select', t);
      EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (true)', t || '_anon_select', t);
    END IF;
  END LOOP;
END $$;

-- Índice único de transaction_id (anti-replay)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='payments') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS payments_transaction_id_uidx
      ON payments (transaction_id)
      WHERE transaction_id IS NOT NULL AND transaction_id <> '';
  END IF;
END $$;
