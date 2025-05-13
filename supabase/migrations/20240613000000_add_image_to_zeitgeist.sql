-- Add image column to zeitgeist table
ALTER TABLE zeitgeist
ADD COLUMN image TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN zeitgeist.image IS 'Path to the image associated with this zeitgeist entry'; 