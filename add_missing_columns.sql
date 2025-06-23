-- Add missing columns to listings table with error handling
-- This script adds only the columns that are missing

-- Add bedrooms column if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'listings' 
   AND column_name = 'bedrooms') = 0,
  'ALTER TABLE listings ADD COLUMN bedrooms INT NULL',
  'SELECT "Column bedrooms already exists in listings table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add bathrooms column if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'listings' 
   AND column_name = 'bathrooms') = 0,
  'ALTER TABLE listings ADD COLUMN bathrooms INT NULL',
  'SELECT "Column bathrooms already exists in listings table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add area column if it doesn't exist (using square_feet as the column name)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'listings' 
   AND column_name = 'square_feet') = 0,
  'ALTER TABLE listings ADD COLUMN square_feet DECIMAL(10,2) NULL',
  'SELECT "Column square_feet already exists in listings table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Show the updated table structure
DESCRIBE listings;
