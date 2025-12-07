-- FIX: Make created_by columns nullable to avoid foreign key errors
-- Run this in Supabase SQL Editor

-- Make created_by nullable in customers table
ALTER TABLE customers 
ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable in products table  
ALTER TABLE products
ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable in orders table
ALTER TABLE orders
ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable in sales table
ALTER TABLE sales
ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable in packing table
ALTER TABLE packing
ALTER COLUMN created_by DROP NOT NULL;

-- Verify changes
SELECT table_name, column_name, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'created_by';
