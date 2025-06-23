/*
  # Integrate Farms Management

  1. Changes
    - Add user_id to fields and plots
    - Update RLS policies for fields and plots
    - Add foreign key constraints
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Add user_id to fields and plots
ALTER TABLE fields ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE plots ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Make user_id required
ALTER TABLE fields ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE plots ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own fields" ON fields;
DROP POLICY IF EXISTS "Users can insert own fields" ON fields;
DROP POLICY IF EXISTS "Users can update own fields" ON fields;
DROP POLICY IF EXISTS "Users can delete own fields" ON fields;

DROP POLICY IF EXISTS "Users can read own plots" ON plots;
DROP POLICY IF EXISTS "Users can insert own plots" ON plots;
DROP POLICY IF EXISTS "Users can update own plots" ON plots;
DROP POLICY IF EXISTS "Users can delete own plots" ON plots;

-- Create new RLS policies for fields
CREATE POLICY "Users can read own fields"
ON fields FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fields"
ON fields FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fields"
ON fields FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fields"
ON fields FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create new RLS policies for plots
CREATE POLICY "Users can read own plots"
ON plots FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plots"
ON plots FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plots"
ON plots FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plots"
ON plots FOR DELETE
TO authenticated
USING (auth.uid() = user_id);