-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tone_checks table
CREATE TABLE IF NOT EXISTS tone_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    message_count INTEGER,
    response_length INTEGER,
    has_tamil_content BOOLEAN,
    has_devotional_tone BOOLEAN,
    has_question BOOLEAN,
    has_comfort BOOLEAN,
    response_word_count INTEGER,
    adherence_score INTEGER
);

-- Create token_usage table
CREATE TABLE IF NOT EXISTS token_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    prompt_tokens INTEGER,
    candidates_tokens INTEGER,
    total_tokens INTEGER
);

-- Enable Row Level Security (RLS) - Optional, but recommended
ALTER TABLE tone_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tone_checks table
CREATE TABLE IF NOT EXISTS tone_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    message_count INTEGER,
    response_length INTEGER,
    has_tamil_content BOOLEAN,
    has_devotional_tone BOOLEAN,
    has_question BOOLEAN,
    has_comfort BOOLEAN,
    response_word_count INTEGER,
    adherence_score INTEGER
);

-- Create token_usage table
CREATE TABLE IF NOT EXISTS token_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTATZ DEFAULT NOW(),
    prompt_tokens INTEGER,
    candidates_tokens INTEGER,
    total_tokens INTEGER
);

-- Enable Row Level Security (RLS) - Optional, but recommended
ALTER TABLE tone_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous inserts (since we use the anon key in the app)
-- Adjust these policies based on your actual security requirements
CREATE POLICY "Allow anonymous inserts" ON tone_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous inserts" ON token_usage FOR INSERT WITH CHECK (true);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT, -- Can be random ID or UUID
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policy for inserting feedback (public)
CREATE POLICY "Allow public insert feedback" ON feedback FOR INSERT WITH CHECK (true);

-- Policy for reading feedback (anon)
CREATE POLICY "Allow public select feedback" ON feedback FOR SELECT USING (true);

-- Create policies to allow reading (optional, for dashboard/debugging)
CREATE POLICY "Allow anonymous select" ON tone_checks FOR SELECT USING (true);
CREATE POLICY "Allow anonymous select" ON token_usage FOR SELECT USING (true);
