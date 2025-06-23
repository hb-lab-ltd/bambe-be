-- Database Update Script for Client System (Step by Step)
-- Run each section individually to avoid errors

-- ===========================================
-- STEP 1: Add columns to inquiries table
-- ===========================================

-- Add client_reply column
ALTER TABLE inquiries ADD COLUMN client_reply TEXT NULL;

-- Add client_replied_at column  
ALTER TABLE inquiries ADD COLUMN client_replied_at TIMESTAMP NULL;

-- Add client_id column
ALTER TABLE inquiries ADD COLUMN client_id INT NULL;

-- ===========================================
-- STEP 2: Add columns to customers table
-- ===========================================

-- Add password column
ALTER TABLE customers ADD COLUMN password VARCHAR(255) NULL;

-- Add status column
ALTER TABLE customers ADD COLUMN status ENUM('active', 'inactive', 'suspended') DEFAULT 'active';

-- Add created_at column
ALTER TABLE customers ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ===========================================
-- STEP 3: Add foreign key constraint
-- ===========================================

-- Add foreign key constraint
ALTER TABLE inquiries ADD CONSTRAINT fk_inquiry_client FOREIGN KEY (client_id) REFERENCES customers(id) ON DELETE SET NULL;

-- ===========================================
-- STEP 4: Create indexes
-- ===========================================

-- Create indexes for inquiries table
CREATE INDEX idx_inquiries_client_id ON inquiries(client_id);
CREATE INDEX idx_inquiries_email ON inquiries(email);
CREATE INDEX idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at);

-- Create indexes for customers table
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);

-- ===========================================
-- STEP 5: Link existing inquiries to customers
-- ===========================================

-- Update existing inquiries to link with customers based on email
UPDATE inquiries i 
JOIN customers c ON i.email = c.email 
SET i.client_id = c.id 
WHERE i.client_id IS NULL;

-- ===========================================
-- STEP 6: Add property detail columns to listings
-- ===========================================

-- Add property detail columns
ALTER TABLE listings ADD COLUMN price DECIMAL(15,2) NULL;
ALTER TABLE listings ADD COLUMN location VARCHAR(255) NULL;
ALTER TABLE listings ADD COLUMN description TEXT NULL;
ALTER TABLE listings ADD COLUMN bedrooms INT NULL;
ALTER TABLE listings ADD COLUMN bathrooms INT NULL;
ALTER TABLE listings ADD COLUMN square_feet DECIMAL(10,2) NULL;

-- ===========================================
-- STEP 7: Create view for client inquiries
-- ===========================================

-- Create a view for client inquiries with property details
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

-- ===========================================
-- STEP 8: Verify the changes
-- ===========================================

-- Show the updated table structure
DESCRIBE inquiries;
DESCRIBE customers;

-- Show sample data
SELECT 'Inquiries count:' as info, COUNT(*) as count FROM inquiries
UNION ALL
SELECT 'Customers count:', COUNT(*) FROM customers
UNION ALL
SELECT 'Linked inquiries:', COUNT(*) FROM inquiries WHERE client_id IS NOT NULL; 