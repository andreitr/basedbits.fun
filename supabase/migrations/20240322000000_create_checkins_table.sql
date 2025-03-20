-- Create checkins table
CREATE TABLE checkins (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  streak INTEGER NOT NULL,
  count INTEGER NOT NULL
);

-- Create index for user_id lookups
CREATE INDEX idx_checkins_user_id ON checkins USING btree (user_id);

-- Add a trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_checkins_updated_at
    BEFORE UPDATE ON checkins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 