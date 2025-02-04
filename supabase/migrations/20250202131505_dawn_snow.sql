/*
  # Initial Schema Setup

  1. New Tables
    - documents: Stores uploaded PDF documents
    - quiz_attempts: Tracks quiz attempts and scores
    - unit_questions: Stores generated questions for each unit

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'uploaded',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_id uuid NOT NULL REFERENCES documents(id),
  unit_index integer NOT NULL,
  status text NOT NULL DEFAULT 'started',
  score float,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, document_id, unit_index, status)
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quiz attempts"
  ON quiz_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON quiz_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz attempts"
  ON quiz_attempts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Unit questions table
CREATE TABLE IF NOT EXISTS unit_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id),
  unit_index integer NOT NULL,
  questions jsonb NOT NULL DEFAULT '{"questions": []}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, unit_index)
);

ALTER TABLE unit_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read questions for their documents"
  ON unit_questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = unit_questions.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_document_id ON quiz_attempts(document_id);
CREATE INDEX IF NOT EXISTS idx_unit_questions_document_id ON unit_questions(document_id);