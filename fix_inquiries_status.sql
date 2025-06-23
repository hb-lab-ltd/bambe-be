-- Fix inquiries status enum to include client_replied
ALTER TABLE inquiries MODIFY COLUMN status ENUM('new', 'replied', 'client_replied', 'closed', 'pending') DEFAULT 'new';

-- Update any existing inquiries that should have client_replied status
-- This will be handled by the application logic 