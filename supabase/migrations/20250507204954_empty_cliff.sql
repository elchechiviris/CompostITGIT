DO $$ 
BEGIN
  -- Add user_id column to all tables if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farms' AND column_name = 'user_id') THEN
    ALTER TABLE farms ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fields' AND column_name = 'user_id') THEN
    ALTER TABLE fields ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plots' AND column_name = 'user_id') THEN
    ALTER TABLE plots ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'piles' AND column_name = 'user_id') THEN
    ALTER TABLE piles ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pile_recipes' AND column_name = 'user_id') THEN
    ALTER TABLE pile_recipes ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'residue_movements' AND column_name = 'user_id') THEN
    ALTER TABLE residue_movements ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;

  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can read own farms" ON farms;
  DROP POLICY IF EXISTS "Users can insert own farms" ON farms;
  DROP POLICY IF EXISTS "Users can update own farms" ON farms;
  DROP POLICY IF EXISTS "Users can delete own farms" ON farms;

  DROP POLICY IF EXISTS "Users can read own fields" ON fields;
  DROP POLICY IF EXISTS "Users can insert own fields" ON fields;
  DROP POLICY IF EXISTS "Users can update own fields" ON fields;
  DROP POLICY IF EXISTS "Users can delete own fields" ON fields;

  DROP POLICY IF EXISTS "Users can read own plots" ON plots;
  DROP POLICY IF EXISTS "Users can insert own plots" ON plots;
  DROP POLICY IF EXISTS "Users can update own plots" ON plots;
  DROP POLICY IF EXISTS "Users can delete own plots" ON plots;

  DROP POLICY IF EXISTS "Users can read own piles" ON piles;
  DROP POLICY IF EXISTS "Users can insert own piles" ON piles;
  DROP POLICY IF EXISTS "Users can update own piles" ON piles;
  DROP POLICY IF EXISTS "Users can delete own piles" ON piles;

  DROP POLICY IF EXISTS "Users can read own pile_recipes" ON pile_recipes;
  DROP POLICY IF EXISTS "Users can insert own pile_recipes" ON pile_recipes;
  DROP POLICY IF EXISTS "Users can update own pile_recipes" ON pile_recipes;
  DROP POLICY IF EXISTS "Users can delete own pile_recipes" ON pile_recipes;

  DROP POLICY IF EXISTS "Users can read own residue_movements" ON residue_movements;
  DROP POLICY IF EXISTS "Users can insert own residue_movements" ON residue_movements;
  DROP POLICY IF EXISTS "Users can update own residue_movements" ON residue_movements;
  DROP POLICY IF EXISTS "Users can delete own residue_movements" ON residue_movements;

  -- Create new RLS policies
  CREATE POLICY "Users can read own farms" ON farms FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own farms" ON farms FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own farms" ON farms FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can delete own farms" ON farms FOR DELETE USING (auth.uid() = user_id);

  CREATE POLICY "Users can read own fields" ON fields FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own fields" ON fields FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own fields" ON fields FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can delete own fields" ON fields FOR DELETE USING (auth.uid() = user_id);

  CREATE POLICY "Users can read own plots" ON plots FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own plots" ON plots FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own plots" ON plots FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can delete own plots" ON plots FOR DELETE USING (auth.uid() = user_id);

  CREATE POLICY "Users can read own piles" ON piles FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own piles" ON piles FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own piles" ON piles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can delete own piles" ON piles FOR DELETE USING (auth.uid() = user_id);

  CREATE POLICY "Users can read own pile_recipes" ON pile_recipes FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own pile_recipes" ON pile_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own pile_recipes" ON pile_recipes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can delete own pile_recipes" ON pile_recipes FOR DELETE USING (auth.uid() = user_id);

  CREATE POLICY "Users can read own residue_movements" ON residue_movements FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own residue_movements" ON residue_movements FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own residue_movements" ON residue_movements FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can delete own residue_movements" ON residue_movements FOR DELETE USING (auth.uid() = user_id);

  -- Make user_id required for future inserts
  ALTER TABLE farms ALTER COLUMN user_id SET NOT NULL;
  ALTER TABLE fields ALTER COLUMN user_id SET NOT NULL;
  ALTER TABLE plots ALTER COLUMN user_id SET NOT NULL;
  ALTER TABLE piles ALTER COLUMN user_id SET NOT NULL;
  ALTER TABLE pile_recipes ALTER COLUMN user_id SET NOT NULL;
  ALTER TABLE residue_movements ALTER COLUMN user_id SET NOT NULL;
END $$;