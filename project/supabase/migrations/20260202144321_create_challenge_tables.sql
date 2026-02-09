/*
  # Create challenge tracking tables

  1. New Tables
    - `cycles`: Tracks individual 30-day challenge cycles per user
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `started_at` (timestamp)
      - `current_day` (integer, 1-30)
      - `completed_at` (timestamp, nullable - null while active)
      
    - `responses`: Daily responses/tracking for each day
      - `id` (uuid, primary key)
      - `cycle_id` (uuid, foreign key to cycles)
      - `day` (integer, 1-30)
      - `evening_response` (text - user's answer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only see/modify their own cycles and responses
*/

CREATE TABLE IF NOT EXISTS cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  current_day integer DEFAULT 1,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  day integer NOT NULL,
  evening_response text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cycles_user_id ON cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_cycle_id ON responses(cycle_id);

ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycles"
  ON cycles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycles"
  ON cycles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycles"
  ON cycles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own responses"
  ON responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cycles
      WHERE cycles.id = responses.cycle_id
      AND cycles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own responses"
  ON responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cycles
      WHERE cycles.id = responses.cycle_id
      AND cycles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own responses"
  ON responses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cycles
      WHERE cycles.id = responses.cycle_id
      AND cycles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cycles
      WHERE cycles.id = responses.cycle_id
      AND cycles.user_id = auth.uid()
    )
  );
