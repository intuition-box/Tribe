-- Create table to cache leaderboard data
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_type text NOT NULL UNIQUE, -- 'top_traders' or 'most_active' - UNIQUE for upserts
  data jsonb NOT NULL,
  last_updated timestamp with time zone DEFAULT NOW(),
  created_at timestamp with time zone DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to leaderboard cache"
ON leaderboard_cache FOR SELECT
TO public
USING (true);

-- Allow anyone to update cache (for refresh mechanism)
CREATE POLICY "Allow cache updates"
ON leaderboard_cache FOR ALL
TO public
USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_type ON leaderboard_cache(cache_type);
