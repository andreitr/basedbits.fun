-- Add hash column to checkins table
ALTER TABLE checkins ADD COLUMN hash TEXT NOT NULL UNIQUE;

-- Create index for hash lookups
CREATE INDEX idx_checkins_hash ON checkins USING btree (hash); 