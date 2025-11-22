# Supabase Setup Instructions

## Step 1: Create Database Tables

1. Go to your Supabase project: https://bohynwyuxdgkxjevrtmy.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Copy and paste the contents of `supabase_schema.sql`
4. Click **Run** to create the tables

## Step 2: Verify Tables

Go to **Table Editor** and verify you have:
- `users` table (id, name, age, email, created_at, updated_at)
- `conversations` table (id, user_id, user_message, model_response, prompt_tokens, candidates_tokens, total_tokens, created_at)

## Step 3: Configure Environment Variables

Ensure your `.env.local` file contains:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://bohynwyuxdgkxjevrtmy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase
```

**Security Note:** Never commit `.env.local` to git. It's already in `.gitignore`.

## How It Works

1. **User Flow:**
   - User accepts consent modal
   - User fills in name, age, email
   - User info is saved to Supabase `users` table
   - If email exists, existing user is loaded

2. **Conversation Auto-Save:**
   - Every chat message is automatically saved to `conversations` table
   - Includes user message, model response, and token usage
   - Linked to user via `user_id`

3. **Data Access:**
   - All data is stored in Supabase
   - Can be queried via Supabase dashboard
   - Can be exported for model training

## Viewing Data

### Via Supabase Dashboard:
1. Go to **Table Editor**
2. Select `users` or `conversations` table
3. View all records

### Via SQL:
```sql
-- Get all users
SELECT * FROM users;

-- Get all conversations for a specific user
SELECT * FROM conversations WHERE user_id = 'user-uuid-here';

-- Get conversation count per user
SELECT u.name, u.email, COUNT(c.id) as conversation_count
FROM users u
LEFT JOIN conversations c ON u.id = c.user_id
GROUP BY u.id, u.name, u.email;

-- Get token usage statistics
SELECT 
  SUM(total_tokens) as total_tokens,
  AVG(total_tokens) as avg_tokens_per_conversation,
  COUNT(*) as total_conversations
FROM conversations;
```

## Troubleshooting

### If user info form doesn't appear:
- Clear browser localStorage
- Refresh the page

### If data isn't saving:
- Check browser console for errors
- Verify Supabase tables are created
- Check RLS policies are enabled
