-- Check database status for inquiries table
-- This script will show the current structure of the inquiries table

-- Show the current table structure
DESCRIBE inquiries;

-- Check if specific columns exist
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE table_schema = DATABASE() 
AND table_name = 'inquiries'
ORDER BY ORDINAL_POSITION;

-- Check if there are any inquiries in the table
SELECT COUNT(*) as total_inquiries FROM inquiries;

-- Show sample data (if any)
SELECT id, name, email, status, created_at FROM inquiries LIMIT 5; 