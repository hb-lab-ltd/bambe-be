-- Fix user_id field issue in customers table
-- This script makes the user_id field nullable so it can be NULL for client registrations

-- Check if user_id column exists and make it nullable
ALTER TABLE customers MODIFY COLUMN user_id INT NULL;

-- Add a comment to explain what user_id is for
-- user_id is typically used to link customers to admin users who created them
-- For client registrations from inquiries, this can be NULL

-- Verify the change
DESCRIBE customers; 