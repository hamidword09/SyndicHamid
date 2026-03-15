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
    amount NUMERIC NOT NULL,
    month_year TEXT, -- Format '03-2024'
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'Paid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
