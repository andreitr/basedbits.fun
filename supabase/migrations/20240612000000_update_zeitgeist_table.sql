-- Rename existing columns
ALTER TABLE zeitgeist RENAME COLUMN word TO headline;
ALTER TABLE zeitgeist RENAME COLUMN summary TO lede;

-- Add new columns
ALTER TABLE zeitgeist ADD COLUMN signal TEXT;
ALTER TABLE zeitgeist ADD COLUMN emotion TEXT;
ALTER TABLE zeitgeist ADD COLUMN status TEXT; 
ALTER TABLE zeitgeist ADD COLUMN token NUMERIC NULL; 