-- Quick Fix for Collation Issues
-- This script fixes the specific collation mismatch between inquiries and customers tables

-- Fix the email columns specifically
ALTER TABLE inquiries MODIFY COLUMN email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE customers MODIFY COLUMN email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Fix name columns
ALTER TABLE inquiries MODIFY COLUMN name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE customers MODIFY COLUMN name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Fix phone columns
ALTER TABLE inquiries MODIFY COLUMN phone VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE customers MODIFY COLUMN phone VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Test the JOIN operation
SELECT COUNT(*) as test_join_count
FROM inquiries i 
JOIN customers c ON i.email = c.email;

-- If the above works, you can now run the client system database updates 