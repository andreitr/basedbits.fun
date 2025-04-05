-- Drop the message_hash column and its index
DROP INDEX IF EXISTS idx_messages_hash;
ALTER TABLE messages DROP COLUMN message_hash;

-- Drop the opened_at column
ALTER TABLE messages DROP COLUMN opened_at;

-- Add the new hash column (nullable)
ALTER TABLE messages ADD COLUMN hash TEXT;

-- Create an index on the new hash column
CREATE INDEX idx_messages_hash ON messages USING btree (hash);

-- Drop the old trigger and function for message_hash
DROP TRIGGER IF EXISTS set_message_hash_trigger ON messages;
DROP FUNCTION IF EXISTS set_message_hash();
DROP FUNCTION IF EXISTS generate_message_hash(); 