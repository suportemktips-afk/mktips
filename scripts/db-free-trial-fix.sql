-- Ajustes pós-hardening / free trial (idempotente)

-- FK de credenciais → users
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_credentials')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users') THEN
    BEGIN
      ALTER TABLE user_credentials
        DROP CONSTRAINT IF EXISTS user_credentials_user_id_fkey;
      ALTER TABLE user_credentials
        ADD CONSTRAINT user_credentials_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;
END $$;

-- Garantir colunas usadas no register
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS tipster_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Índice e-mail (login)
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- Defaults seguros para Free
ALTER TABLE users ALTER COLUMN plan SET DEFAULT 'Free';
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'User';
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'Ativo';
ALTER TABLE users ALTER COLUMN days_remaining SET DEFAULT 7;
