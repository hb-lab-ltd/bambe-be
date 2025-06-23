-- Safe Fix for Admin Reply Issue
-- This script checks if columns exist before adding them

-- Check and add client_id column if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'inquiries' 
   AND column_name = 'client_id') = 0,
  'ALTER TABLE inquiries ADD COLUMN client_id INT NULL',
  'SELECT "Column client_id already exists in inquiries table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add client_reply column if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'inquiries' 
   AND column_name = 'client_reply') = 0,
  'ALTER TABLE inquiries ADD COLUMN client_reply TEXT NULL',
  'SELECT "Column client_reply already exists in inquiries table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add client_replied_at column if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'inquiries' 
   AND column_name = 'client_replied_at') = 0,
  'ALTER TABLE inquiries ADD COLUMN client_replied_at TIMESTAMP NULL',
  'SELECT "Column client_replied_at already exists in inquiries table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add foreign key constraint if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
   WHERE table_schema = DATABASE() 
   AND table_name = 'inquiries' 
   AND column_name = 'client_id' 
   AND referenced_table_name = 'customers') = 0,
  'ALTER TABLE inquiries ADD CONSTRAINT fk_inquiries_client_id FOREIGN KEY (client_id) REFERENCES customers(id) ON DELETE SET NULL',
  'SELECT "Foreign key constraint for client_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add index if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'inquiries' 
   AND index_name = 'idx_inquiries_client_id') = 0,
  'CREATE INDEX idx_inquiries_client_id ON inquiries(client_id)',
  'SELECT "Index idx_inquiries_client_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Show the current table structure
DESCRIBE inquiries; 