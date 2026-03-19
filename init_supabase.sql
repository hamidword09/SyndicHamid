-- SCRIPT D'INITIALISATION SUPABASE POUR SYNDIC GRAVITY
-- À copier-coller dans le "SQL Editor" de Supabase

-- 1. Table des Résidents
CREATE TABLE IF NOT EXISTS residents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    apt TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    contribution NUMERIC DEFAULT 0,
    type TEXT, -- 'Propriétaire', 'Locataire'
    status TEXT DEFAULT 'À jour',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des Dépenses
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    provider TEXT,
    category TEXT, -- 'electricity', 'cleaning', 'maintenance', 'diverse'
    amount NUMERIC NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des Paiements (Cotisations)
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    apt TEXT,
    owner TEXT,
    amount NUMERIC NOT NULL,
    month_year TEXT, -- Format '03-2024'
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'Paid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des Autres Revenus
CREATE TABLE IF NOT EXISTS extra_revenues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    payer TEXT,
    category TEXT, -- 'rent', 'donation', 'interest', 'other'
    amount NUMERIC NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des Projets de Réparation
CREATE TABLE IF NOT EXISTS repairs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    budget NUMERIC NOT NULL,
    collected NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed'
    icon TEXT DEFAULT 'hammer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table des Cotisations de Réparation (Lien Résidents <-> Projets)
CREATE TABLE IF NOT EXISTS repair_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    repair_id UUID REFERENCES repairs(id) ON DELETE CASCADE,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table des Demandes de Maintenance
CREATE TABLE IF NOT EXISTS maintenance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'in-progress', 'resolved'
    resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Table des Sondages / Votes
CREATE TABLE IF NOT EXISTS polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'closed'
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Table des Options de Vote
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    label TEXT NOT NULL
);

-- 10. Table des Votes Individuels
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, resident_id) -- Un seul vote par résident par sondage
);

-- 11. Table des Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Administratif', 'Réunions', 'Finances', etc.
    file_type TEXT, -- 'PDF', 'EXCEL', 'IMAGE'
    file_size TEXT, -- e.g. '2.4 MB'
    file_url TEXT, -- Lien vers le fichier (Storage Supabase)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- RLS (Row Level Security) : admin = tout, résident = read-only
-- sauf paiements (table `payments` en INSERT).
--
-- Hypothèses:
-- - Les comptes sont "authentifiés" via Supabase Auth.
-- - Le rôle admin est dans app_metadata.role = 'admin' (ou user_metadata.role).
-- - `residents.user_id` existe et référence auth.users(id).
-- =========================================================

-- Ajoute residents.user_id si absent (pour relier chaque résident à auth.users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'residents'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.residents
      ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Admin check basé sur JWT (app_metadata.role ou user_metadata.role)
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) = 'admin';
$$;

-- Retourne l'ID du résident lié à l'utilisateur connecté
create or replace function public.current_resident_id()
returns uuid
language sql
stable
as $$
  select r.id
  from public.residents r
  where r.user_id = auth.uid()
  limit 1;
$$;

-- Active RLS sur toutes les tables exposées par l'API
alter table public.residents enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.extra_revenues enable row level security;
alter table public.repairs enable row level security;
alter table public.repair_contributions enable row level security;
alter table public.maintenance enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.documents enable row level security;

-- ----------------------------
-- residents
-- ----------------------------
create policy "residents read authenticated"
on public.residents
for select
to authenticated
using (
  public.is_admin()
  or id = public.current_resident_id()
);

create policy "residents admin write"
on public.residents
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ----------------------------
-- payments (cotisations)
-- - read-only pour tous (authenticated)
-- - INSERT autorisé pour admin OU résident sur ses propres paiements
-- ----------------------------
create policy "payments read authenticated"
on public.payments
for select
to authenticated
using (
  public.is_admin()
  or resident_id = public.current_resident_id()
);

create policy "payments insert admin_or_own_resident"
on public.payments
for insert
to authenticated
with check (
  public.is_admin()
  or resident_id = public.current_resident_id()
);

create policy "payments admin update"
on public.payments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "payments admin delete"
on public.payments
for delete
to authenticated
using (public.is_admin());

-- ----------------------------
-- expenses
-- ----------------------------
create policy "expenses read authenticated"
on public.expenses
for select
to authenticated
using (true);

create policy "expenses admin write"
on public.expenses
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ----------------------------
-- extra_revenues
-- ----------------------------
create policy "extra_revenues read authenticated"
on public.extra_revenues
for select
to authenticated
using (true);

create policy "extra_revenues admin write"
on public.extra_revenues
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ----------------------------
-- repairs
-- ----------------------------
create policy "repairs read authenticated"
on public.repairs
for select
to authenticated
using (true);

create policy "repairs admin write"
on public.repairs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ----------------------------
-- repair_contributions
-- ----------------------------
create policy "repair_contributions read authenticated"
on public.repair_contributions
for select
to authenticated
using (true);

create policy "repair_contributions admin write"
on public.repair_contributions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ----------------------------
-- maintenance
-- ----------------------------
create policy "maintenance read authenticated"
on public.maintenance
for select
to authenticated
using (true);

create policy "maintenance admin write"
on public.maintenance
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ----------------------------
-- polls / voting
-- Résident = read-only (pas d'INSERT/UPDATE/DELETE sur poll_votes)
-- ----------------------------
create policy "polls read authenticated"
on public.polls
for select
to authenticated
using (true);

create policy "polls admin write"
on public.polls
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "poll_options read authenticated"
on public.poll_options
for select
to authenticated
using (true);

create policy "poll_options admin write"
on public.poll_options
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "poll_votes read authenticated"
on public.poll_votes
for select
to authenticated
using (true);

create policy "poll_votes admin write"
on public.poll_votes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ----------------------------
-- documents
-- ----------------------------
create policy "documents read authenticated"
on public.documents
for select
to authenticated
using (true);

create policy "documents admin write"
on public.documents
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
