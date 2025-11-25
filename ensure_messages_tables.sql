-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    language TEXT DEFAULT 'tamil',
    current_stage INTEGER DEFAULT 0,
    is_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    stage INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Allow public insert conversations" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select conversations" ON conversations FOR SELECT USING (true);
CREATE POLICY "Allow public update conversations" ON conversations FOR UPDATE USING (true);

-- Create policies for messages
CREATE POLICY "Allow public insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select messages" ON messages FOR SELECT USING (true);
