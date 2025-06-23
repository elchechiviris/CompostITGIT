/*
  # Add updated_at column to fields table

  1. Changes
    - Add updated_at column to fields table
    - Set default value to now()
    - Update existing rows
*/

ALTER TABLE fields
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update existing rows to have updated_at set
UPDATE fields
SET updated_at = created_at
WHERE updated_at IS NULL;