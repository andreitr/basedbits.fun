-- Rename user_id column to id
ALTER TABLE users RENAME COLUMN user_id TO id;

-- Update the checkins table foreign key reference
ALTER TABLE checkins DROP CONSTRAINT checkins_user_id_fkey;
ALTER TABLE checkins ADD CONSTRAINT checkins_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id); 