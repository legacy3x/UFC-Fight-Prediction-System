/*
  UFC Prediction System Database Schema v2.0
  - Adds tables for model storage and performance tracking
  - Enhances fighter data with scraping metadata
  - Adds prediction history tracking
*/

-- Add model storage table
CREATE TABLE IF NOT EXISTS model_storage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_json jsonb NOT NULL,
  weights jsonb NOT NULL,
  version text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE model_storage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Model storage is admin only"
  ON model_storage
  FOR ALL
  TO authenticated
  USING (auth.role() = 'admin');

-- Add model performance tracking
CREATE TABLE IF NOT EXISTS model_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accuracy decimal NOT NULL,
  precision decimal NOT NULL,
  recall decimal NOT NULL,
  f1 decimal NOT NULL,
  confusion_matrix jsonb NOT NULL,
  test_size integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE model_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Performance metrics are viewable by everyone"
  ON model_performance
  FOR SELECT
  TO authenticated
  USING (true);

-- Enhance fighters table with scraping metadata
ALTER TABLE fighters ADD COLUMN IF NOT EXISTS last_scraped timestamptz;
ALTER TABLE fighters ADD COLUMN IF NOT EXISTS data_sources text[];
ALTER TABLE fighters ADD COLUMN IF NOT EXISTS data_quality_score decimal;

-- Add prediction history table
CREATE TABLE IF NOT EXISTS prediction_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fighter1_id uuid REFERENCES fighters(id),
  fighter2_id uuid REFERENCES fighters(id),
  predicted_winner_id uuid REFERENCES fighters(id),
  predicted_method text NOT NULL,
  predicted_round integer,
  confidence_score decimal NOT NULL,
  actual_winner_id uuid REFERENCES fighters(id),
  actual_method text,
  actual_round integer,
  is_correct boolean,
  features_used jsonb NOT NULL,
  model_version text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prediction_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prediction history is viewable by everyone"
  ON prediction_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Add training data table
CREATE TABLE IF NOT EXISTS training_fights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fighter1_id uuid REFERENCES fighters(id),
  fighter2_id uuid REFERENCES fighters(id),
  winner_id uuid REFERENCES fighters(id),
  method text NOT NULL,
  round integer,
  features jsonb NOT NULL,
  outcome jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_fights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Training data is admin only"
  ON training_fights
  FOR ALL
  TO authenticated
  USING (auth.role() = 'admin');

-- Add test data table (similar to training but for evaluation)
CREATE TABLE IF NOT EXISTS test_fights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fighter1_id uuid REFERENCES fighters(id),
  fighter2_id uuid REFERENCES fighters(id),
  winner_id uuid REFERENCES fighters(id),
  method text NOT NULL,
  round integer,
  features jsonb NOT NULL,
  outcome jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_fights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Test data is admin only"
  ON test_fights
  FOR ALL
  TO authenticated
  USING (auth.role() = 'admin');

-- Add triggers for new tables
CREATE TRIGGER update_model_storage_updated_at
  BEFORE UPDATE ON model_storage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prediction_history_updated_at
  BEFORE UPDATE ON prediction_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to update data quality score
CREATE OR REPLACE FUNCTION update_fighter_data_quality()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate quality score based on data completeness
  NEW.data_quality_score := 
    CASE 
      WHEN NEW.strike_accuracy IS NULL THEN 0.7
      WHEN NEW.takedown_accuracy IS NULL THEN 0.8
      WHEN array_length(NEW.data_sources, 1) > 1 THEN 0.95
      ELSE 0.85
    END;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fighter_data_quality
  BEFORE INSERT OR UPDATE ON fighters
  FOR EACH ROW
  EXECUTE FUNCTION update_fighter_data_quality();

-- Create view for fighter predictions
CREATE OR REPLACE VIEW fighter_prediction_stats AS
SELECT 
  f.id as fighter_id,
  f.name,
  COUNT(CASE WHEN ph.predicted_winner_id = f.id THEN 1 END) as predicted_wins,
  COUNT(CASE WHEN ph.actual_winner_id = f.id THEN 1 END) as actual_wins,
  COUNT(CASE WHEN ph.predicted_winner_id = f.id AND ph.is_correct = true THEN 1 END) as correct_predictions,
  COUNT(CASE WHEN ph.predicted_winner_id = f.id AND ph.is_correct = false THEN 1 END) as incorrect_predictions,
  AVG(CASE WHEN ph.predicted_winner_id = f.id THEN ph.confidence_score END) as avg_confidence
FROM fighters f
LEFT JOIN prediction_history ph ON f.id = ph.fighter1_id OR f.id = ph.fighter2_id
GROUP BY f.id, f.name;

-- Create view for model performance trends
CREATE OR REPLACE VIEW model_performance_trends AS
SELECT 
  date_trunc('day', created_at) as day,
  AVG(accuracy) as avg_accuracy,
  AVG(precision) as avg_precision,
  AVG(recall) as avg_recall,
  COUNT(*) as evaluation_count
FROM model_performance
GROUP BY day
ORDER BY day;

-- Create RLS policy for admin users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO admin;
