-- Create meme_tokens table for storing tokens shared across all users
CREATE TABLE IF NOT EXISTS public.meme_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  image TEXT,
  current_price DECIMAL(20, 10) DEFAULT 0.0001533,
  start_price DECIMAL(20, 10) DEFAULT 0.0001533,
  market_cap DECIMAL(20, 10) DEFAULT 0,
  max_supply BIGINT DEFAULT 1000000000,
  current_supply BIGINT DEFAULT 0,
  holders INTEGER DEFAULT 1,
  creator TEXT NOT NULL,
  intuition_link TEXT,
  is_alpha BOOLEAN DEFAULT true,
  contract_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(intuition_link)
);

-- Enable RLS for security
ALTER TABLE public.meme_tokens ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view all tokens (read-only)
CREATE POLICY "Allow public read access"
  ON public.meme_tokens FOR SELECT
  USING (true);

-- Allow anyone to insert new tokens
CREATE POLICY "Allow anyone to create tokens"
  ON public.meme_tokens FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update their own tokens (based on creator)
CREATE POLICY "Allow users to update their own tokens"
  ON public.meme_tokens FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX idx_intuition_link ON public.meme_tokens(intuition_link) WHERE intuition_link IS NOT NULL;
CREATE INDEX idx_creator ON public.meme_tokens(creator);
CREATE INDEX idx_created_at ON public.meme_tokens(created_at DESC);
