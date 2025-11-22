# Supabase 406 Error - Complete Fix Guide

## What's Happening
You're getting a **406 error** when trying to save user data to Supabase. This means the database tables aren't properly set up or RLS is blocking access.

## Solution (Follow in Order)

### Step 1: Run Complete Setup SQL
1. Open Supabase Dashboard: https://supabase.com/dashboard/project/bohynwyuxdgkxjevrtmy
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy **EVERYTHING** from `complete_setup.sql`
5. Paste into the editor
6. Click **RUN** or press Ctrl+Enter
7. Wait for "Success" message

### Step 2: Verify Tables Created
1. Go to **Table Editor** (left sidebar)
2. You should see:
   - ✅ `users` table with columns: id, name, age, email, created_at, updated_at
   - ✅ `conversations` table with columns: id, user_id, user_message, model_response, etc.

### Step 3: Check RLS is Disabled
1. In **Table Editor**, click on `users` table
2. Look for **RLS** badge - it should say **"RLS disabled"** or **OFF**
3. Do the same for `conversations` table

### Step 4: Test with Console Logging
1. Clear browser console (F12 → Console → Clear)
2. Clear localStorage: `localStorage.clear()`
3. Refresh page
4. Accept consent
5. Fill user form
6. Watch console for emoji logs:
   - 🔵 = Starting process
   - 🔍 = Checking user
   - ✅ = Success
   - ❌ = Error (look at details)

### Step 5: If Still Getting 406

Run this in Supabase SQL Editor:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'conversations');

-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'conversations');
```

Expected output:
- Both tables should appear
- `rowsecurity` should be `false` (RLS disabled)

### Step 6: Nuclear Option (If Nothing Works)

1. Go to **Table Editor**
2. Delete both tables manually
3. Go back to **SQL Editor**
4. Run `complete_setup.sql` again
5. Verify tables are created with RLS disabled

## Common Issues

**"relation 'users' does not exist"**
- Tables weren't created
- Run `complete_setup.sql` again

**"406 error persists"**
- RLS is still enabled
- Run: `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`
- Run: `ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;`

**"No error but data not saving"**
- Check browser console for emoji logs
- User ID might not be set
- Look for ⚠️ warning messages

## Verify It's Working

After setup, you should see in console:
```
🔵 Submitting user info: {...}
🔍 Checking if user exists...
➕ Creating new user...
✅ User created: <uuid>
✅ User info saved successfully!
💾 Saving conversation to Supabase...
✅ Conversation saved to Supabase: [...]
```

No ❌ errors should appear!
