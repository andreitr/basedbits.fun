CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE,
    message_hash TEXT UNIQUE NOT NULL,
    bounty NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on the message_hash column for faster lookups
CREATE INDEX idx_messages_hash ON messages USING btree (message_hash);

-- Create an index on user_id for faster foreign key lookups
CREATE INDEX idx_messages_user_id ON messages USING btree (user_id);

-- Function to generate a random hash
CREATE OR REPLACE FUNCTION generate_message_hash()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set message_hash on insert
CREATE OR REPLACE FUNCTION set_message_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.message_hash := generate_message_hash();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_message_hash_trigger
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION set_message_hash();

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 