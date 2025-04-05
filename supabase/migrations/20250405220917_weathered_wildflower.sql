/*
  # UFC Fighter Database Schema

  1. New Tables
    - `fighters`
      - Basic fighter information (name, age, physical attributes)
      - Record and statistics
      - Fighting style metrics
    - `fights`
      - Historical fight data
      - Outcomes and methods of victory
    - `weight_classes`
      - Standard UFC weight divisions
    - `fight_stats`
      - Detailed fight performance metrics
      - Strike and grappling statistics

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read data
    - Restrict write access to admin users
*/

-- Weight Classes
CREATE TABLE IF NOT EXISTS weight_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  weight_limit decimal NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE weight_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Weight classes are viewable by everyone"
  ON weight_classes
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert standard UFC weight classes
INSERT INTO weight_classes (name, weight_limit) VALUES
  ('Flyweight', 125),
  ('Bantamweight', 135),
  ('Featherweight', 145),
  ('Lightweight', 155),
  ('Welterweight', 170),
  ('Middleweight', 185),
  ('Light Heavyweight', 205),
  ('Heavyweight', 265)
ON CONFLICT (name) DO NOTHING;

-- Fighters Table
CREATE TABLE IF NOT EXISTS fighters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  nickname text,
  age integer,
  height_cm decimal,
  reach_cm decimal,
  weight_class_id uuid REFERENCES weight_classes(id),
  stance text CHECK (stance IN ('Orthodox', 'Southpaw', 'Switch')),
  
  -- Record
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  draws integer DEFAULT 0,
  no_contests integer DEFAULT 0,
  
  -- Win methods
  wins_by_ko integer DEFAULT 0,
  wins_by_submission integer DEFAULT 0,
  wins_by_decision integer DEFAULT 0,
  
  -- Loss methods
  losses_by_ko integer DEFAULT 0,
  losses_by_submission integer DEFAULT 0,
  losses_by_decision integer DEFAULT 0,
  
  -- Fighting metrics (percentages stored as decimals between 0 and 1)
  strike_accuracy decimal CHECK (strike_accuracy BETWEEN 0 AND 1),
  strike_defense decimal CHECK (strike_defense BETWEEN 0 AND 1),
  takedown_accuracy decimal CHECK (takedown_accuracy BETWEEN 0 AND 1),
  takedown_defense decimal CHECK (takedown_defense BETWEEN 0 AND 1),
  
  -- Average fight statistics
  strikes_landed_per_min decimal,
  strikes_absorbed_per_min decimal,
  takedowns_per_15min decimal,
  submission_attempts_per_15min decimal,
  
  -- Style ratings (0-1 scale)
  striking_rating decimal CHECK (striking_rating BETWEEN 0 AND 1),
  grappling_rating decimal CHECK (grappling_rating BETWEEN 0 AND 1),
  wrestling_rating decimal CHECK (wrestling_rating BETWEEN 0 AND 1),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_record CHECK (
    wins >= 0 AND
    losses >= 0 AND
    draws >= 0 AND
    no_contests >= 0
  ),
  CONSTRAINT valid_win_methods CHECK (
    wins_by_ko + wins_by_submission + wins_by_decision = wins
  ),
  CONSTRAINT valid_loss_methods CHECK (
    losses_by_ko + losses_by_submission + losses_by_decision = losses
  )
);

ALTER TABLE fighters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fighters are viewable by everyone"
  ON fighters
  FOR SELECT
  TO authenticated
  USING (true);

-- Fights Table
CREATE TABLE IF NOT EXISTS fights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fighter1_id uuid REFERENCES fighters(id),
  fighter2_id uuid REFERENCES fighters(id),
  weight_class_id uuid REFERENCES weight_classes(id),
  event_name text,
  event_date date,
  
  winner_id uuid REFERENCES fighters(id),
  method text CHECK (method IN ('KO/TKO', 'Submission', 'Decision', 'No Contest')),
  method_details text,
  round integer CHECK (round BETWEEN 1 AND 5),
  round_time interval,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT different_fighters CHECK (fighter1_id != fighter2_id)
);

ALTER TABLE fights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fights are viewable by everyone"
  ON fights
  FOR SELECT
  TO authenticated
  USING (true);

-- Fight Statistics
CREATE TABLE IF NOT EXISTS fight_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fight_id uuid REFERENCES fights(id),
  fighter_id uuid REFERENCES fighters(id),
  
  -- Striking stats
  significant_strikes_landed integer DEFAULT 0,
  significant_strikes_attempted integer DEFAULT 0,
  total_strikes_landed integer DEFAULT 0,
  total_strikes_attempted integer DEFAULT 0,
  
  -- Takedown stats
  takedowns_landed integer DEFAULT 0,
  takedowns_attempted integer DEFAULT 0,
  
  -- Control stats
  control_time interval,
  
  -- Grappling stats
  submission_attempts integer DEFAULT 0,
  reversals integer DEFAULT 0,
  guard_passes integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_strikes CHECK (
    significant_strikes_landed <= significant_strikes_attempted AND
    total_strikes_landed <= total_strikes_attempted
  ),
  CONSTRAINT valid_takedowns CHECK (
    takedowns_landed <= takedowns_attempted
  )
);

ALTER TABLE fight_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fight stats are viewable by everyone"
  ON fight_stats
  FOR SELECT
  TO authenticated
  USING (true);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fighters_updated_at
  BEFORE UPDATE ON fighters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fights_updated_at
  BEFORE UPDATE ON fights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fight_stats_updated_at
  BEFORE UPDATE ON fight_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weight_classes_updated_at
  BEFORE UPDATE ON weight_classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
