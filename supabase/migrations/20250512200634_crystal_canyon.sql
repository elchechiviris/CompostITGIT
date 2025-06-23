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

-- Drop ALL existing policies for farms
DO $$
BEGIN
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON farms;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON farms;
  DROP POLICY IF EXISTS "Enable update access for authenticated users" ON farms;
  DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON farms;
  DROP POLICY IF EXISTS "Users can read own farms" ON farms;
  DROP POLICY IF EXISTS "Users can insert own farms" ON farms;
  DROP POLICY IF EXISTS "Users can update own farms" ON farms;
  DROP POLICY IF EXISTS "Users can delete own farms" ON farms;
END $$;

-- Create new RLS policies with unique names
CREATE POLICY "farms_select_policy"
ON farms FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "farms_insert_policy"
ON farms FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "farms_update_policy"
ON farms FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "farms_delete_policy"
ON farms FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add client relationship
ALTER TABLE farms
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id);

-- Create activity tracking for farms
CREATE OR REPLACE FUNCTION public.handle_farm_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO client_activities (client_id, type, description, reference_id, user_id)
    VALUES (NEW.client_id, 'farm', 'Farm created: ' || NEW.name, NEW.id, NEW.user_id);
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO client_activities (client_id, type, description, reference_id, user_id)
    VALUES (NEW.client_id, 'farm', 'Farm updated: ' || NEW.name, NEW.id, NEW.user_id);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO client_activities (client_id, type, description, reference_id, user_id)
    VALUES (OLD.client_id, 'farm', 'Farm deleted: ' || OLD.name, OLD.id, OLD.user_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for farm activities
DROP TRIGGER IF EXISTS farm_activity_trigger ON farms;
CREATE TRIGGER farm_activity_trigger
  AFTER INSERT OR UPDATE OR DELETE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION handle_farm_activity();