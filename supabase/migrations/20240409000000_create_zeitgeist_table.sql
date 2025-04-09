-- Create zeitgeist table
CREATE TABLE zeitgeist (
  id SERIAL PRIMARY KEY,
  word TEXT,
  summary TEXT,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for word lookups
CREATE INDEX idx_zeitgeist_word ON zeitgeist USING btree (word);

-- Add a trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_zeitgeist_updated_at
    BEFORE UPDATE ON zeitgeist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 