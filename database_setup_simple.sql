-- Simple Database Setup Script for Agent System
-- This script is compatible with all MySQL versions

-- Create inquiries table
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add foreign key constraint (run this separately if you get an error)
-- ALTER TABLE inquiries ADD CONSTRAINT fk_inquiries_property_id 
-- FOREIGN KEY (property_id) REFERENCES listings(listing_id) ON DELETE SET NULL;

-- Add missing columns to listings table (run these one by one if you get errors)
-- ALTER TABLE listings ADD COLUMN views INT DEFAULT 0;

-- Add missing columns to customers table (run these one by one if you get errors)
-- ALTER TABLE customers ADD COLUMN status ENUM('active', 'inactive', 'pending') DEFAULT 'active';
-- ALTER TABLE customers ADD COLUMN vip BOOLEAN DEFAULT FALSE;
-- ALTER TABLE customers ADD COLUMN properties_count INT DEFAULT 0;
-- ALTER TABLE customers ADD COLUMN last_contact TIMESTAMP NULL;
-- ALTER TABLE customers ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
-- ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add indexes (run these one by one if you get errors)
-- CREATE INDEX idx_inquiries_property_id ON inquiries(property_id);
-- CREATE INDEX idx_inquiries_status ON inquiries(status);
-- CREATE INDEX idx_inquiries_priority ON inquiries(priority);
-- CREATE INDEX idx_inquiries_created_at ON inquiries(created_at);
-- CREATE INDEX idx_customers_status ON customers(status);
-- CREATE INDEX idx_customers_created_at ON customers(created_at);
-- CREATE INDEX idx_listings_user_id ON listings(user_id);
-- CREATE INDEX idx_listings_status ON listings(status);
-- CREATE INDEX idx_listings_created_at ON listings(created_at);
-- CREATE INDEX idx_listings_listing_type ON listings(listing_type);

-- Sample data (uncomment if needed)
-- INSERT INTO inquiries (name, email, phone, message, property_id, status, priority) VALUES
-- ('John Doe', 'john@example.com', '+250789123456', 'I am interested in this property. Can you provide more details?', 1, 'new', 'medium'),
-- ('Jane Smith', 'jane@example.com', '+250789123457', 'What is the exact location of this property?', 1, 'replied', 'high'),
-- ('Mike Johnson', 'mike@example.com', '+250789123458', 'Is this property still available?', 2, 'new', 'low'); 