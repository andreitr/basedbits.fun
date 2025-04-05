-- Rename hash column to txn_hash
ALTER TABLE messages RENAME COLUMN hash TO txn_hash;

-- Add new rand_hash column
ALTER TABLE messages ADD COLUMN rand_hash TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex');

-- Update the index to use txn_hash instead of hash
DROP INDEX IF EXISTS idx_messages_hash;
CREATE INDEX idx_messages_txn_hash ON messages USING btree (txn_hash);
CREATE INDEX idx_messages_rand_hash ON messages USING btree (rand_hash); 