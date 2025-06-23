-- Test script to understand customers table structure
-- This will help us identify what fields are required

-- Show table structure
DESCRIBE customers;

-- Show table creation statement
SHOW CREATE TABLE customers;

-- Try to insert a minimal record to see what's required
-- INSERT INTO customers (name, email) VALUES ('Test', 'test@test.com'); 