-- Add separate tracking for comment points and trading points
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS comment_points DECIMAL DEFAULT 0;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS trading_points DECIMAL DEFAULT 0;

-- Update existing records to split points into trading and comment
UPDATE user_points 
SET 
  trading_points = points,
  comment_points = 0
WHERE trading_points IS NULL OR comment_points IS NULL;

-- Add comment to explain the new columns
COMMENT ON COLUMN user_points.trading_points IS 'Points earned from trading volume using logarithmic formula';
COMMENT ON COLUMN user_points.comment_points IS 'Points earned from posting comments (0.025 per comment)';
COMMENT ON COLUMN user_points.points IS 'Total points = trading_points + comment_points';
