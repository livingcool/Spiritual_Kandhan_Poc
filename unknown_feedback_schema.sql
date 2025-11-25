-- Create the unknown_feedback table
CREATE TABLE IF NOT EXISTS unknown_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    feedback_text TEXT,
    rating INTEGER,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE unknown_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to insert feedback
CREATE POLICY "Allow public insert access" 
ON unknown_feedback 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow anyone to view feedback (optional, depending on your needs)
CREATE POLICY "Allow public select access" 
ON unknown_feedback 
FOR SELECT 
TO public 
USING (true);

-- Grant permissions to public/anon roles if needed (usually handled by policies, but good for explicit access)
GRANT ALL ON unknown_feedback TO anon;
GRANT ALL ON unknown_feedback TO authenticated;
GRANT ALL ON unknown_feedback TO service_role;
