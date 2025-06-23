-- Fix Admin Reply Issue
-- Add missing columns to inquiries table

USE your_database_name; -- Replace with your actual database name

-- Add client_id column if it doesn't exist
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS client_id INT NULL;

-- Add client_reply column if it doesn't exist  
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS client_reply TEXT NULL;

-- Add client_replied_at column if it doesn't exist
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS client_replied_at TIMESTAMP NULL;

-- Show the updated table structure
DESCRIBE inquiries; 