-- Create user_points table to track trading points
CREATE TABLE IF NOT EXISTS user_points (
  wallet_address TEXT PRIMARY KEY,
  total_buy_volume NUMERIC DEFAULT 0,
  total_sell_volume NUMERIC DEFAULT 0,
  total_volume NUMERIC DEFAULT 0,
  points NUMERIC DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_points_wallet ON user_points(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_points_points ON user_points(points DESC);

-- Enable RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read points (public leaderboard)
CREATE POLICY "Anyone can read user points" ON user_points
  FOR SELECT USING (true);

-- Allow users to update their own points
CREATE POLICY "Users can update their own points" ON user_points
  FOR ALL USING (true);
