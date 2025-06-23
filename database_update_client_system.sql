-- Database Update Script for Client System
-- This script adds the necessary columns for client replies and ensures proper functionality
-- Compatible with older MySQL versions

-- Add client_reply and client_replied_at columns to inquiries table
-- Check if columns exist first to avoid errors
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'inquiries' 
     AND COLUMN_NAME = 'client_reply') = 0,
    'ALTER TABLE inquiries ADD COLUMN client_reply TEXT NULL',
    'SELECT "client_reply column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'inquiries' 
     AND COLUMN_NAME = 'client_replied_at') = 0,
    'ALTER TABLE inquiries ADD COLUMN client_replied_at TIMESTAMP NULL',
    'SELECT "client_replied_at column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add password column to customers table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'customers' 
     AND COLUMN_NAME = 'password') = 0,
    'ALTER TABLE customers ADD COLUMN password VARCHAR(255) NULL',
    'SELECT "password column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add status column to customers table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'customers' 
     AND COLUMN_NAME = 'status') = 0,
    'ALTER TABLE customers ADD COLUMN status ENUM("active", "inactive", "suspended") DEFAULT "active"',
    'SELECT "status column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add created_at column to customers table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'customers' 
     AND COLUMN_NAME = 'created_at') = 0,
    'ALTER TABLE customers ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT "created_at column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add client_id column to inquiries table if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'inquiries' 
     AND COLUMN_NAME = 'client_id') = 0,
    'ALTER TABLE inquiries ADD COLUMN client_id INT NULL',
    'SELECT "client_id column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'inquiries' 
     AND COLUMN_NAME = 'client_id' 
     AND CONSTRAINT_NAME = 'fk_inquiry_client') = 0,
    'ALTER TABLE inquiries ADD CONSTRAINT fk_inquiry_client FOREIGN KEY (client_id) REFERENCES customers(id) ON DELETE SET NULL',
    'SELECT "foreign key constraint already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create indexes for better performance (check if they exist first)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'inquiries' 
     AND INDEX_NAME = 'idx_inquiries_client_id') = 0,
    'CREATE INDEX idx_inquiries_client_id ON inquiries(client_id)',
    'SELECT "index idx_inquiries_client_id already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'inquiries' 
     AND INDEX_NAME = 'idx_inquiries_email') = 0,
    'CREATE INDEX idx_inquiries_email ON inquiries(email)',
    'SELECT "index idx_inquiries_email already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'customers' 
     AND INDEX_NAME = 'idx_customers_email') = 0,
    'CREATE INDEX idx_customers_email ON customers(email)',
    'SELECT "index idx_customers_email already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'customers' 
     AND INDEX_NAME = 'idx_customers_status') = 0,
    'CREATE INDEX idx_customers_status ON customers(status)',
    'SELECT "index idx_customers_status already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing inquiries to link with customers based on email
UPDATE inquiries i 
JOIN customers c ON i.email = c.email 
SET i.client_id = c.id 
WHERE i.client_id IS NULL;

-- Add any missing indexes for the inquiries table
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'inquiries' 
     AND INDEX_NAME = 'idx_inquiries_property_id') = 0,
    'CREATE INDEX idx_inquiries_property_id ON inquiries(property_id)',
    'SELECT "index idx_inquiries_property_id already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'inquiries' 
     AND INDEX_NAME = 'idx_inquiries_status') = 0,
    'CREATE INDEX idx_inquiries_status ON inquiries(status)',
    'SELECT "index idx_inquiries_status already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'inquiries' 
     AND INDEX_NAME = 'idx_inquiries_created_at') = 0,
    'CREATE INDEX idx_inquiries_created_at ON inquiries(created_at)',
    'SELECT "index idx_inquiries_created_at already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure the inquiries table has all necessary columns with proper types
-- Modify status column if it exists
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'inquiries' 
     AND COLUMN_NAME = 'status') > 0,
    'ALTER TABLE inquiries MODIFY COLUMN status ENUM("new", "replied", "client_replied", "closed") DEFAULT "new"',
    'SELECT "status column does not exist" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Modify priority column if it exists
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'inquiries' 
     AND COLUMN_NAME = 'priority') > 0,
    'ALTER TABLE inquiries MODIFY COLUMN priority ENUM("low", "medium", "high") DEFAULT "medium"',
    'SELECT "priority column does not exist" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add any missing columns to listings table for property details
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'listings' 
     AND COLUMN_NAME = 'price') = 0,
    'ALTER TABLE listings ADD COLUMN price DECIMAL(15,2) NULL',
    'SELECT "price column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'listings' 
     AND COLUMN_NAME = 'location') = 0,
    'ALTER TABLE listings ADD COLUMN location VARCHAR(255) NULL',
    'SELECT "location column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'listings' 
     AND COLUMN_NAME = 'description') = 0,
    'ALTER TABLE listings ADD COLUMN description TEXT NULL',
    'SELECT "description column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'listings' 
     AND COLUMN_NAME = 'bedrooms') = 0,
    'ALTER TABLE listings ADD COLUMN bedrooms INT NULL',
    'SELECT "bedrooms column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'listings' 
     AND COLUMN_NAME = 'bathrooms') = 0,
    'ALTER TABLE listings ADD COLUMN bathrooms INT NULL',
    'SELECT "bathrooms column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'listings' 
     AND COLUMN_NAME = 'square_feet') = 0,
    'ALTER TABLE listings ADD COLUMN square_feet DECIMAL(10,2) NULL',
    'SELECT "square_feet column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create a view for client inquiries with property details
DROP VIEW IF EXISTS client_inquiries_view;
CREATE VIEW client_inquiries_view AS
SELECT 
    i.id,
    i.name,
    i.email,
    i.phone,
    i.message,
    i.property_id,
    i.status,
    i.priority,
    i.created_at,
    i.reply_message,
    i.replied_at,
    i.client_reply,
    i.client_replied_at,
    i.client_id,
    l.title as property_name,
    l.listing_id,
    l.price,
    l.location,
    l.description,
    l.bedrooms,
    l.bathrooms,
    l.square_feet
FROM inquiries i
LEFT JOIN listings l ON i.property_id = l.listing_id;

-- Show the updated table structure
DESCRIBE inquiries;
DESCRIBE customers;

-- Show sample data
SELECT 'Inquiries count:' as info, COUNT(*) as count FROM inquiries
UNION ALL
SELECT 'Customers count:', COUNT(*) FROM customers
UNION ALL
SELECT 'Linked inquiries:', COUNT(*) FROM inquiries WHERE client_id IS NOT NULL; 