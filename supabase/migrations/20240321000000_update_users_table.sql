-- Drop the primary key constraint from address
ALTER TABLE users DROP CONSTRAINT users_pkey;

-- Add user_id column as auto-incrementing primary key
ALTER TABLE users ADD COLUMN user_id BIGSERIAL PRIMARY KEY;

-- Add unique constraint on address
ALTER TABLE users ADD CONSTRAINT users_address_unique UNIQUE (address); 