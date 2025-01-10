ALTER TABLE communities
ALTER COLUMN chain_id TYPE integer USING chain_id::integer;