/*
  # Add response value tracking for decisions

  1. New Column
    - `responses` table gets `response_value` column (boolean)
      - true = rule followed / decision made
      - false = rule violated / decision not made
      - null = no response yet
    - This enables response aggregation without interpretation

  2. Purpose
    - Track yes/no responses for summary aggregation
    - Enables counting of rule-followed vs violated responses
    - Used to generate silent summary statistics
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'responses' AND column_name = 'response_value'
  ) THEN
    ALTER TABLE responses ADD COLUMN response_value boolean;
  END IF;
END $$;
