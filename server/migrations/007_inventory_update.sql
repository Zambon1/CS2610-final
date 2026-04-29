ALTER TABLE inventory
  ALTER COLUMN status TYPE VARCHAR(32)
  USING CASE status
    WHEN 0 THEN 'available'
    WHEN 1 THEN 'in use'
    WHEN 2 THEN 'under maintenance'
    ELSE 'available'
  END;

ALTER TABLE inventory
  ALTER COLUMN status SET DEFAULT 'available';

ALTER TABLE inventory
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS project_id;