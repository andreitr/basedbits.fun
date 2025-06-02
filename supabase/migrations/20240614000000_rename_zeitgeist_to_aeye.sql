-- Rename zeitgeist table to aeye
ALTER TABLE zeitgeist RENAME TO aeye;

-- Rename the index
ALTER INDEX idx_zeitgeist_word RENAME TO idx_aeye_headline;

-- Rename the trigger
ALTER TRIGGER update_zeitgeist_updated_at ON aeye RENAME TO update_aeye_updated_at; 