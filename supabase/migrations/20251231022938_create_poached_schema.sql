/*
  # Poached Tennis Training App - Database Schema

  ## Overview
  Creates the complete database schema for Poached, a premium tennis training app
  that generates custom drills and sessions based on player level and goals.

  ## New Tables

  ### 1. profiles
  Extends auth.users with tennis-specific player information
  - `id` (uuid, primary key, references auth.users)
  - `utr` (decimal) - Universal Tennis Rating (1.0 - 16.5)
  - `handedness` (text) - left, right, or ambidextrous
  - `playstyle` (text) - aggressive baseline, counterpuncher, serve-volley, all-court
  - `goals` (text) - player's training objectives
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. drills
  Library of tennis drills with difficulty levels and metadata
  - `id` (uuid, primary key)
  - `name` (text) - drill name
  - `description` (text) - brief overview
  - `category` (text) - forehand, backhand, serve, return, volleys, overheads, movement, patterns
  - `min_utr` (decimal) - minimum recommended UTR
  - `max_utr` (decimal) - maximum recommended UTR
  - `intensity_level` (text) - light, medium, high
  - `default_duration_minutes` (integer)
  - `instructions` (jsonb) - step-by-step directions
  - `coaching_cues` (jsonb) - teaching points
  - `created_at` (timestamptz)

  ### 3. sessions
  User-generated training sessions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text) - session name/title
  - `intensity` (text) - light, medium, high
  - `session_length` (integer) - total minutes
  - `focus_areas` (jsonb) - array of focus categories
  - `environment` (text) - alone, partner, coach
  - `surface` (text, optional) - hard, clay, grass
  - `created_at` (timestamptz)

  ### 4. session_drills
  Junction table linking drills to sessions in specific order
  - `id` (uuid, primary key)
  - `session_id` (uuid, references sessions)
  - `drill_id` (uuid, references drills)
  - `order_index` (integer) - sequence position
  - `duration_minutes` (integer) - time allocated
  - `notes` (text, optional)

  ### 5. favorite_drills
  User's bookmarked/favorite drills
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `drill_id` (uuid, references drills)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own profiles, sessions, and favorites
  - Drills are publicly readable but only admin writable
  - Policies enforce authentication and ownership
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  utr decimal(3,1) DEFAULT 5.0,
  handedness text DEFAULT 'right',
  playstyle text DEFAULT 'baseline',
  goals text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create drills table
CREATE TABLE IF NOT EXISTS drills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  min_utr decimal(3,1) DEFAULT 1.0,
  max_utr decimal(3,1) DEFAULT 16.5,
  intensity_level text NOT NULL,
  default_duration_minutes integer DEFAULT 10,
  instructions jsonb DEFAULT '[]'::jsonb,
  coaching_cues jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drills are viewable by authenticated users"
  ON drills FOR SELECT
  TO authenticated
  USING (true);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  intensity text NOT NULL,
  session_length integer NOT NULL,
  focus_areas jsonb DEFAULT '[]'::jsonb,
  environment text DEFAULT 'alone',
  surface text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create session_drills table
CREATE TABLE IF NOT EXISTS session_drills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions ON DELETE CASCADE NOT NULL,
  drill_id uuid REFERENCES drills ON DELETE CASCADE NOT NULL,
  order_index integer NOT NULL,
  duration_minutes integer NOT NULL,
  notes text DEFAULT ''
);

ALTER TABLE session_drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view session drills for own sessions"
  ON session_drills FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_drills.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create session drills for own sessions"
  ON session_drills FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_drills.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update session drills for own sessions"
  ON session_drills FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_drills.session_id
      AND sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_drills.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete session drills for own sessions"
  ON session_drills FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_drills.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Create favorite_drills table
CREATE TABLE IF NOT EXISTS favorite_drills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  drill_id uuid REFERENCES drills ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, drill_id)
);

ALTER TABLE favorite_drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorite_drills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites"
  ON favorite_drills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorite_drills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_drills_session_id ON session_drills(session_id);
CREATE INDEX IF NOT EXISTS idx_favorite_drills_user_id ON favorite_drills(user_id);
CREATE INDEX IF NOT EXISTS idx_drills_category ON drills(category);
CREATE INDEX IF NOT EXISTS idx_drills_utr_range ON drills(min_utr, max_utr);
