-- ===================================================================
-- PRIVAULT: ACCOUNT MANAGEMENT
-- Run this in the Supabase SQL Editor to enable account-level
-- management features: email changes and full account deletion.
-- ===================================================================

-- ==========================================
-- 1. FUNCTION: delete_user_account()
-- ==========================================
-- Permanently deletes the authenticated user's entire account.
-- This is called via supabase.rpc('delete_user_account').
--
-- What it does:
--   1. Deletes the user's profile (cascades to related data via FK).
--   2. Deletes the user from auth.users (the nuclear option).
--
-- SECURITY: Uses SECURITY DEFINER so it can touch auth.users,
-- but the internal check ensures only the calling user can
-- delete themselves. The function is owned by the postgres role.
-- ==========================================

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the currently authenticated user's ID
    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Delete all user data from public tables.
    --    Most of these cascade from auth.users, but we do it
    --    explicitly for safety and auditability.
    DELETE FROM vault_otp_verifications WHERE user_id = current_user_id;
    DELETE FROM password_history        WHERE user_id = current_user_id;
    DELETE FROM audit_log               WHERE user_id = current_user_id;
    DELETE FROM security_events         WHERE user_id = current_user_id;
    DELETE FROM vault_credentials       WHERE user_id = current_user_id;
    DELETE FROM profiles                WHERE user_id = current_user_id;

    -- 2. Delete the user from Supabase Auth.
    --    This is the final, irreversible step.
    DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;


-- ==========================================
-- 2. FUNCTION: change_user_email()
-- ==========================================
-- Updates the user's email in both auth.users AND the profiles table.
-- Supabase's built-in updateUser({ email }) sends a confirmation
-- email to the NEW address. This companion function updates the
-- profiles table to keep it in sync AFTER the user confirms.
--
-- NOTE: In practice, you may want to use a Supabase Auth hook
-- or trigger to auto-sync the profiles.email column when the
-- auth.users.email changes. This function provides a manual
-- sync mechanism called from the client after confirmation.
-- ==========================================

CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    current_email TEXT;
BEGIN
    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get the latest email from auth.users
    SELECT email INTO current_email
    FROM auth.users
    WHERE id = current_user_id;

    IF current_email IS NULL THEN
        RAISE EXCEPTION 'User not found in auth.users';
    END IF;

    -- Update the profiles table to match
    UPDATE profiles
    SET email = current_email
    WHERE user_id = current_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION sync_profile_email() TO authenticated;


-- ==========================================
-- 3. TRIGGER: auto-sync email on auth change
-- ==========================================
-- This trigger automatically keeps profiles.email in sync
-- whenever Supabase Auth updates the user's email (e.g. after
-- the user confirms their new email address).
-- ==========================================

CREATE OR REPLACE FUNCTION sync_profile_email_on_auth_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        UPDATE profiles
        SET email = NEW.email
        WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_email ON auth.users;
CREATE TRIGGER trg_sync_profile_email
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_profile_email_on_auth_change();


-- ==========================================
-- VERIFICATION
-- ==========================================
-- Run these queries individually to verify setup:
-- 1. Check functions exist:
--    SELECT routine_name FROM information_schema.routines
--    WHERE routine_schema = 'public'
--    AND routine_name IN ('delete_user_account', 'sync_profile_email');
--
-- 2. Check trigger exists:
--    SELECT trigger_name, event_manipulation
--    FROM information_schema.triggers
--    WHERE trigger_name = 'trg_sync_profile_email';
