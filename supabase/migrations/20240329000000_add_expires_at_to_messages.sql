-- Add expires_at column to messages table
ALTER TABLE messages ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Create an index on expires_at for faster lookups
CREATE INDEX idx_messages_expires_at ON messages USING btree (expires_at); 