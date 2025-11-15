-- Create starred tokens table to track user favorites
CREATE TABLE IF NOT EXISTS public.starred_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  starred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_address, token_address)
);

-- Enable RLS
ALTER TABLE public.starred_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own starred tokens
CREATE POLICY "Users can read their own starred tokens"
  ON public.starred_tokens
  FOR SELECT
  TO public
  USING (true);

-- Allow users to star tokens
CREATE POLICY "Users can star tokens"
  ON public.starred_tokens
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to unstar tokens
CREATE POLICY "Users can unstar tokens"
  ON public.starred_tokens
  FOR DELETE
  TO public
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_starred_tokens_user ON public.starred_tokens(user_address);
CREATE INDEX IF NOT EXISTS idx_starred_tokens_token ON public.starred_tokens(token_address);
