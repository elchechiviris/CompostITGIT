/*
  # Add Clients Table and Relationships

  1. New Tables
    - clients
      - id (uuid, primary key)
      - display_id (text, unique)
      - name (text)
      - address (text)
      - email (text)
      - phone (text)
      - responsible (text)
      - vat_number (text)
      - type (text) - either 'supplier' or 'customer'
      - created_at (timestamptz)
      - updated_at (timestamptz)
      - user_id (uuid, foreign key)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id text UNIQUE NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  responsible text NOT NULL,
  vat_number text NOT NULL,
  type text NOT NULL CHECK (type IN ('supplier', 'customer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own clients"
ON clients FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
ON clients FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
ON clients FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
ON clients FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add client_id to relevant tables
ALTER TABLE farms ADD COLUMN client_id uuid REFERENCES clients(id);
ALTER TABLE residues ADD COLUMN client_id uuid REFERENCES clients(id);
ALTER TABLE piles ADD COLUMN client_id uuid REFERENCES clients(id);