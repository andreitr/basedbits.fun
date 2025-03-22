-- Add block information columns to checkins table
ALTER TABLE checkins ADD COLUMN block_number BIGINT NOT NULL;
ALTER TABLE checkins ADD COLUMN block_timestamp BIGINT NOT NULL;

-- Create index for block_number lookups
CREATE INDEX idx_checkins_block_number ON checkins USING btree (block_number); 