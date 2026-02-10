/*
  # Add challenge type to cycles

  1. New Column
    - `cycles` table gets `challenge_type` column (text)
      - 'belépő' = 3-day onboarding challenge
      - 'döntési-diéta' = 30-day main challenge
      - defaults to 'döntési-diéta' for backward compatibility

  2. Purpose
    - Track which challenge/program a cycle belongs to
    - Support multiple challenge types and durations
    - Enable unlocking 30-day after completing 3-day
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cycles' AND column_name = 'challenge_type'
  ) THEN
    ALTER TABLE cycles ADD COLUMN challenge_type text DEFAULT 'döntési-diéta';
  END IF;
END $$;
