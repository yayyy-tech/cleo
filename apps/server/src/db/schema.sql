-- Dime Database Schema
-- Run this in Supabase SQL Editor

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ============================================================
-- Helper: auto-update updated_at column
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  monthly_income BIGINT DEFAULT 0,          -- paise
  occupation TEXT,
  city TEXT,
  avatar_url TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_users_phone ON users(phone);

-- ============================================================
-- 2. ACCOUNTS
-- ============================================================
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_name TEXT,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('savings', 'current', 'credit_card')),
  balance BIGINT DEFAULT 0,                  -- paise
  last_synced TIMESTAMPTZ,
  finvu_consent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- ============================================================
-- 3. TRANSACTIONS
-- ============================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL,                    -- paise (positive=credit, negative=debit)
  currency TEXT DEFAULT 'INR',
  description TEXT NOT NULL DEFAULT '',
  merchant_name TEXT,
  category TEXT,
  subcategory TEXT,
  emoji TEXT,
  transaction_date TIMESTAMPTZ NOT NULL,
  reference_id TEXT,
  mode TEXT NOT NULL DEFAULT 'OTHER' CHECK (mode IN ('UPI', 'NEFT', 'IMPS', 'CARD', 'CASH', 'OTHER')),
  is_recurring BOOLEAN DEFAULT FALSE,
  is_income BOOLEAN DEFAULT FALSE,
  is_salary BOOLEAN DEFAULT FALSE,
  is_emi BOOLEAN DEFAULT FALSE,
  enriched BOOLEAN DEFAULT FALSE,
  enrichment_source TEXT DEFAULT 'pending',   -- pending | merchant_db | ai | manual
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(user_id, category);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_enrichment ON transactions(user_id) WHERE enrichment_source = 'pending';

-- ============================================================
-- 4. BUDGETS
-- ============================================================
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  limit_amount BIGINT NOT NULL,              -- paise
  spent_amount BIGINT DEFAULT 0,             -- paise
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly')),
  month_year TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE UNIQUE INDEX idx_budgets_user_category_month ON budgets(user_id, category, month_year);

-- ============================================================
-- 5. MESSAGES
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_user_created ON messages(user_id, created_at DESC);

-- ============================================================
-- 6. MEMORIES (pgvector)
-- ============================================================
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1024),
  category TEXT NOT NULL DEFAULT 'context' CHECK (category IN ('preference', 'fact', 'context', 'financial')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================
-- 7. INSIGHTS
-- ============================================================
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('spending_spike', 'recurring_charge', 'savings_opportunity', 'roast', 'tip', 'deep_dive')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  amount_related BIGINT,                     -- paise
  category TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_user_id ON insights(user_id);
CREATE INDEX idx_insights_user_unread ON insights(user_id) WHERE read = FALSE;

-- ============================================================
-- 8. SAVINGS GOALS
-- ============================================================
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount BIGINT NOT NULL,             -- paise
  current_amount BIGINT DEFAULT 0,           -- paise
  emoji TEXT DEFAULT '🎯',
  deadline TIMESTAMPTZ,
  auto_save_amount BIGINT,                   -- paise
  auto_save_frequency TEXT CHECK (auto_save_frequency IN ('daily', 'weekly', 'monthly')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);

-- ============================================================
-- 9. RECURRING CHARGES
-- ============================================================
CREATE TABLE recurring_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  amount BIGINT NOT NULL,                    -- paise
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  category TEXT,
  last_charged_at TIMESTAMPTZ,
  next_expected_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recurring_charges_user_id ON recurring_charges(user_id);

-- ============================================================
-- 10. ADVANCE REQUESTS
-- ============================================================
CREATE TABLE advance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,                    -- paise
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disbursed', 'repaid', 'rejected')),
  repay_date TIMESTAMPTZ NOT NULL,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_advance_requests_user_id ON advance_requests(user_id);

-- ============================================================
-- 11. CREDIT SCORES
-- ============================================================
CREATE TABLE credit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  provider TEXT NOT NULL DEFAULT 'internal',
  factors JSONB DEFAULT '[]',
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_scores_user_id ON credit_scores(user_id);
CREATE INDEX idx_credit_scores_latest ON credit_scores(user_id, fetched_at DESC);

-- ============================================================
-- Vector similarity search function
-- ============================================================
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1024),
  match_user_id UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  content TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.user_id,
    m.content,
    m.category,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM memories m
  WHERE m.user_id = match_user_id
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own messages" ON messages FOR ALL USING (auth.uid() = user_id);

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own memories" ON memories FOR ALL USING (auth.uid() = user_id);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own insights" ON insights FOR ALL USING (auth.uid() = user_id);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own goals" ON savings_goals FOR ALL USING (auth.uid() = user_id);

ALTER TABLE recurring_charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own recurring charges" ON recurring_charges FOR ALL USING (auth.uid() = user_id);

ALTER TABLE advance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own advance requests" ON advance_requests FOR ALL USING (auth.uid() = user_id);

ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own credit scores" ON credit_scores FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- MIGRATION: Run these if tables already exist from v1 schema
-- ============================================================
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_income BOOLEAN DEFAULT FALSE;
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_salary BOOLEAN DEFAULT FALSE;
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_emi BOOLEAN DEFAULT FALSE;
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS enrichment_source TEXT DEFAULT 'pending';
-- ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes TEXT;
-- ALTER TABLE accounts ADD COLUMN IF NOT EXISTS account_name TEXT;
-- ALTER TABLE budgets ADD COLUMN IF NOT EXISTS month_year TEXT NOT NULL DEFAULT to_char(NOW(), 'YYYY-MM');
-- ALTER TABLE savings_goals ADD COLUMN IF NOT EXISTS auto_save_amount BIGINT;
-- ALTER TABLE savings_goals ADD COLUMN IF NOT EXISTS auto_save_frequency TEXT;
-- ALTER TABLE savings_goals ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
-- DROP INDEX IF EXISTS idx_budgets_user_category_period;
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_user_category_month ON budgets(user_id, category, month_year);
-- CREATE INDEX IF NOT EXISTS idx_transactions_enrichment ON transactions(user_id) WHERE enrichment_source = 'pending';
