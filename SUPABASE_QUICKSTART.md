# How to Create Supabase Tables

## Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/bohynwyuxdgkxjevrtmy
2. Log in if needed
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Schema SQL
1. Click **New Query**
2. Copy ALL the content from `supabase_schema.sql` file in this project
3. Paste it into the SQL editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Tables
1. Click **Table Editor** in the left sidebar
2. You should see two tables:
   - `users`
   - `conversations`

### Step 4: Test the Application
1. Clear browser localStorage (F12 → Console → type `localStorage.clear()`)
2. Refresh the page
3. Accept consent
4. Fill in user info
5. Start chatting

## Troubleshooting

**If you get "relation 'users' does not exist" error:**
- The tables weren't created
- Re-run the SQL from Step 2

**If you get 406 error:**
- Tables don't exist in Supabase
- Follow Step 2 again

**If user form doesn't save:**
- Check browser console (F12) for errors
- Verify `.env.local` has correct Supabase credentials
- Restart dev server: `npm run dev`

## What the Tables Store

### `users` table:
- User information (name, age, email)
- Created once per user
- Email is unique

### `conversations` table:
- Every chat message pair (user + model)
- Links to user via `user_id`
- Includes token usage data
