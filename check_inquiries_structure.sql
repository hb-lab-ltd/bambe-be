-- Check current inquiries table structure
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