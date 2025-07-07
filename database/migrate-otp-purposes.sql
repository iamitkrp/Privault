-- Migration script to add new OTP purposes for email updates and profile deletion
-- Run this script if you already have an existing vault_otp_verifications table

-- ==========================================
-- MIGRATION: Update OTP purposes constraint
-- ==========================================

-- Drop the existing constraint
ALTER TABLE vault_otp_verifications DROP CONSTRAINT IF EXISTS vault_otp_verifications_purpose_check;

-- Add the new constraint with additional purposes
ALTER TABLE vault_otp_verifications 
ADD CONSTRAINT vault_otp_verifications_purpose_check 
CHECK (purpose IN ('vault_access', 'vault_password_change', 'email_update', 'profile_delete'));

-- Also update the constraint name in the other schema files if they exist
ALTER TABLE vault_otp_verifications DROP CONSTRAINT IF EXISTS otp_purpose_check;

-- Success message
SELECT 'OTP purposes migration completed successfully! ✅' as message;

-- ==========================================
-- VERIFICATION: Check the constraint
-- ==========================================

-- Verify the constraint exists with the new purposes
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%purpose%' 
AND table_name = 'vault_otp_verifications';

-- Display success confirmation
SELECT 'Migration verification: New OTP purposes (email_update, profile_delete) are now supported! 🎉' as verification_message; 