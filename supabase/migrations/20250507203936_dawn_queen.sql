/*
  # Add user_id and update RLS policies for residues table

  1. Changes
    - Add user_id column to residues table
    - Update RLS policies to use user_id for authorization
    
  2. Security
    - Enable RLS on residues table
    - Add policies for CRUD operations based on user ownership
*/

-- Add user_id column
ALTER TABLE residues 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing rows to use the current user's ID
UPDATE residues 
SET user_id = auth.uid()
WHERE user_id IS NULL;

-- Make user_id required for future inserts
ALTER TABLE residues
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON residues;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON residues;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON residues;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON residues;
DROP POLICY IF EXISTS "Users can delete own residues" ON residues;
DROP POLICY IF EXISTS "Users can insert own residues" ON residues;
DROP POLICY IF EXISTS "Users can read own residues" ON residues;
DROP POLICY IF EXISTS "Users can update own residues" ON residues;

-- Create new RLS policies
CREATE POLICY "Users can read own residues"
ON residues FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own residues"
ON residues FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own residues"
ON residues FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own residues"
ON residues FOR DELETE
TO authenticated
USING (auth.uid() = user_id);