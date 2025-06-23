-- Fix Collation Issues Script
-- This script standardizes collation across all tables to prevent collation conflicts

-- ===========================================
-- STEP 1: Check current collation settings
-- ===========================================

-- Show current database collation
SELECT @@collation_database as database_collation;

-- Show table collations
SELECT 
    TABLE_NAME,
    TABLE_COLLATION
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE();

-- Show column collations for text columns
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLLATION_NAME,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND COLLATION_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

-- ===========================================
-- STEP 2: Fix collation for inquiries table
-- ===========================================

-- Convert inquiries table to utf8mb4_general_ci
ALTER TABLE inquiries CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- ===========================================
-- STEP 3: Fix collation for customers table
-- ===========================================

-- Convert customers table to utf8mb4_general_ci
ALTER TABLE customers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- ===========================================
-- STEP 4: Fix collation for listings table
-- ===========================================

-- Convert listings table to utf8mb4_general_ci
ALTER TABLE listings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- ===========================================
-- STEP 5: Fix collation for other related tables
-- ===========================================

-- Convert users table if it exists
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Convert categories table if it exists
ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Convert products table if it exists
ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Convert orders table if it exists
ALTER TABLE orders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- ===========================================
-- STEP 6: Update the database collation
-- ===========================================

-- Set database collation (this will affect new tables)
ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- ===========================================
-- STEP 7: Verify the fixes
-- ===========================================

-- Show updated table collations
SELECT 
    TABLE_NAME,
    TABLE_COLLATION
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE();

-- Show updated column collations
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLLATION_NAME,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND COLLATION_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

-- Test the JOIN operation that was failing
SELECT COUNT(*) as test_join_count
FROM inquiries i 
JOIN customers c ON i.email = c.email;

-- ===========================================
-- STEP 8: Re-run the client system setup
-- ===========================================

-- Now you can safely run the client system database updates
-- The collation issues should be resolved 