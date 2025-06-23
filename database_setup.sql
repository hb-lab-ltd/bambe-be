-- Create inquiries table if it doesn't exist
CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  property_id INT,
  status ENUM('new', 'replied', 'closed', 'pending') DEFAULT 'new',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  notes TEXT,
  reply_message TEXT,
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES listings(listing_id) ON DELETE SET NULL
);

-- Add indexes for better performance (MySQL compatible syntax)
-- Check if index exists before creating (MySQL 5.7+ compatible)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'inquiries' 
   AND index_name = 'idx_inquiries_property_id') = 0,
  'CREATE INDEX idx_inquiries_property_id ON inquiries(property_id)',
  'SELECT "Index idx_inquiries_property_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'inquiries' 
   AND index_name = 'idx_inquiries_status') = 0,
  'CREATE INDEX idx_inquiries_status ON inquiries(status)',
  'SELECT "Index idx_inquiries_status already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'inquiries' 
   AND index_name = 'idx_inquiries_priority') = 0,
  'CREATE INDEX idx_inquiries_priority ON inquiries(priority)',
  'SELECT "Index idx_inquiries_priority already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'inquiries' 
   AND index_name = 'idx_inquiries_created_at') = 0,
  'CREATE INDEX idx_inquiries_created_at ON inquiries(created_at)',
  'SELECT "Index idx_inquiries_created_at already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add missing columns to existing tables if they don't exist
-- Add views column to listings table
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'listings' 
   AND column_name = 'views') = 0,
  'ALTER TABLE listings ADD COLUMN views INT DEFAULT 0',
  'SELECT "Column views already exists in listings table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add status column to customers table if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'customers' 
   AND column_name = 'status') = 0,
  'ALTER TABLE customers ADD COLUMN status ENUM("active", "inactive", "pending") DEFAULT "active"',
  'SELECT "Column status already exists in customers table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add vip column to customers table if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'customers' 
   AND column_name = 'vip') = 0,
  'ALTER TABLE customers ADD COLUMN vip BOOLEAN DEFAULT FALSE',
  'SELECT "Column vip already exists in customers table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add properties_count column to customers table if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'customers' 
   AND column_name = 'properties_count') = 0,
  'ALTER TABLE customers ADD COLUMN properties_count INT DEFAULT 0',
  'SELECT "Column properties_count already exists in customers table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add last_contact column to customers table if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'customers' 
   AND column_name = 'last_contact') = 0,
  'ALTER TABLE customers ADD COLUMN last_contact TIMESTAMP NULL',
  'SELECT "Column last_contact already exists in customers table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add created_at column to customers table if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'customers' 
   AND column_name = 'created_at') = 0,
  'ALTER TABLE customers ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'SELECT "Column created_at already exists in customers table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add updated_at column to customers table if it doesn't exist
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'customers' 
   AND column_name = 'updated_at') = 0,
  'ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  'SELECT "Column updated_at already exists in customers table"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for better performance on customers table
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'customers' 
   AND index_name = 'idx_customers_status') = 0,
  'CREATE INDEX idx_customers_status ON customers(status)',
  'SELECT "Index idx_customers_status already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'customers' 
   AND index_name = 'idx_customers_created_at') = 0,
  'CREATE INDEX idx_customers_created_at ON customers(created_at)',
  'SELECT "Index idx_customers_created_at already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for better performance on listings table
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'listings' 
   AND index_name = 'idx_listings_user_id') = 0,
  'CREATE INDEX idx_listings_user_id ON listings(user_id)',
  'SELECT "Index idx_listings_user_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'listings' 
   AND index_name = 'idx_listings_status') = 0,
  'CREATE INDEX idx_listings_status ON listings(status)',
  'SELECT "Index idx_listings_status already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'listings' 
   AND index_name = 'idx_listings_created_at') = 0,
  'CREATE INDEX idx_listings_created_at ON listings(created_at)',
  'SELECT "Index idx_listings_created_at already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'listings' 
   AND index_name = 'idx_listings_listing_type') = 0,
  'CREATE INDEX idx_listings_listing_type ON listings(listing_type)',
  'SELECT "Index idx_listings_listing_type already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insert sample data for testing (optional - uncomment if needed)
-- INSERT INTO inquiries (name, email, phone, message, property_id, status, priority) VALUES
-- ('John Doe', 'john@example.com', '+250789123456', 'I am interested in this property. Can you provide more details?', 1, 'new', 'medium'),
-- ('Jane Smith', 'jane@example.com', '+250789123457', 'What is the exact location of this property?', 1, 'replied', 'high'),
-- ('Mike Johnson', 'mike@example.com', '+250789123458', 'Is this property still available?', 2, 'new', 'low');

-- Update customers table to add sample data if needed
-- UPDATE customers SET status = 'active', vip = FALSE, properties_count = 0 WHERE status IS NULL; 