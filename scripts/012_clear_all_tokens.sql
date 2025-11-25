-- Clear all existing token data from the database
-- This prepares the launchpad for a new contract integration

-- Delete all starred tokens
DELETE FROM starred_tokens;

-- Delete all token holders
DELETE FROM token_holders;

-- Delete all user points
DELETE FROM user_points;

-- Delete all meme tokens
DELETE FROM meme_tokens;

-- Optional: Keep user profiles if users are still the same
-- Uncomment the line below if you want to clear user profiles too
-- DELETE FROM user_profiles;
