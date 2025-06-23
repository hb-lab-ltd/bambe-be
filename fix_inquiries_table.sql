-- Fix inquiries table - add missing columns for client functionality
-- This script adds the missing columns that are referenced in the controller

-- Add client_id column to inquiries table
ALTER TABLE inquiries ADD COLUMN client_id INT NULL;

-- Add client_reply column to inquiries table
ALTER TABLE inquiries ADD COLUMN client_reply TEXT NULL;

-- Add client_replied_at column to inquiries table
ALTER TABLE inquiries ADD COLUMN client_replied_at TIMESTAMP NULL;

-- Add foreign key constraint for client_id
ALTER TABLE inquiries ADD CONSTRAINT fk_inquiries_client_id 
FOREIGN KEY (client_id) REFERENCES customers(id) ON DELETE SET NULL;

-- Add index for client_id
CREATE INDEX idx_inquiries_client_id ON inquiries(client_id);

-- Verify the table structure
DESCRIBE inquiries; 