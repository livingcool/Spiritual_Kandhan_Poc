-- Rename existing conversations table to legacy_message_logs
ALTER TABLE IF EXISTS conversations RENAME TO legacy_message_logs;

-- Rename conversations_new to conversations
ALTER TABLE IF EXISTS conversations_new RENAME TO conversations;

-- Rename messages_new to messages
ALTER TABLE IF EXISTS messages_new RENAME TO messages;

-- Rename error_logs_new to error_logs
ALTER TABLE IF EXISTS error_logs_new RENAME TO error_logs;

-- Update foreign key constraints if necessary (Supabase/Postgres usually handles this, but good to be safe)
-- Note: Postgres automatically renames the constraints' target tables, but the constraint names themselves might remain old.
-- We can optionally rename constraints for clarity, but it's not strictly required for functionality.

-- Example of renaming a constraint (if needed, but skipping for now to avoid errors if names differ)
-- ALTER TABLE messages RENAME CONSTRAINT messages_new_conversation_id_fkey TO messages_conversation_id_fkey;

-- Verify policies (Policies are attached to the table OID, so they should persist with the rename)
-- However, if policies reference the table name by string in definitions (rare), they might need check.
-- Standard RLS policies usually just work.

-- Grant permissions on new table names if they were specific to old names (Grants follow the table)
