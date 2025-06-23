/*
  # Add Client Integration and Activity Tracking

  1. Changes
    - Add user_id to farms table
    - Add client relationships to farms, residues, and piles
    - Create activity tracking table
    - Set up RLS policies
    
  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Add user_id to farms if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE farms ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Make user_id required
ALTER TABLE farms 
ALTER COLUMN user_id SET NOT NULL;

-- Drop and recreate policies only if they don't exist
DO $$
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for authenticated users' AND tablename = 'farms') THEN
    DROP POLICY "Enable read access for authenticated users" ON farms;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable insert access for authenticated users' AND tablename = 'farms') THEN
    DROP POLICY "Enable insert access for authenticated users" ON farms;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable update access for authenticated users' AND tablename = 'farms') THEN
    DROP POLICY "Enable update access for authenticated users" ON farms;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable delete access for authenticated users' AND tablename = 'farms') THEN
    DROP POLICY "Enable delete access for authenticated users" ON farms;
  END IF;

  -- Create new policies only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own farms' AND tablename = 'farms') THEN
    CREATE POLICY "Users can read own farms"
    ON farms FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own farms' AND tablename = 'farms') THEN
    CREATE POLICY "Users can insert own farms"
    ON farms FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own farms' AND tablename = 'farms') THEN
    CREATE POLICY "Users can update own farms"
    ON farms FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own farms' AND tablename = 'farms') THEN
    CREATE POLICY "Users can delete own farms"
    ON farms FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add client relationships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farms' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE farms ADD COLUMN client_id uuid REFERENCES clients(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residues' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE residues ADD COLUMN client_id uuid REFERENCES clients(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'piles' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE piles ADD COLUMN client_id uuid REFERENCES clients(id);
  END IF;
END $$;

-- Create activity tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS client_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('farm', 'residue', 'pile', 'microbiology')),
  description text NOT NULL,
  reference_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS on activities
ALTER TABLE client_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activities only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own client activities' AND tablename = 'client_activities') THEN
    CREATE POLICY "Users can read own client activities"
    ON client_activities FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own client activities' AND tablename = 'client_activities') THEN
    CREATE POLICY "Users can insert own client activities"
    ON client_activities FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own client activities' AND tablename = 'client_activities') THEN
    CREATE POLICY "Users can delete own client activities"
    ON client_activities FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;