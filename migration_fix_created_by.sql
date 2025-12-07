-- Migration: Make created_by fields nullable
-- Run this in Supabase SQL Editor to fix foreign key constraint errors

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

-- Make created_by nullable in inventory_movements table
ALTER TABLE inventory_movements 
ALTER COLUMN created_by DROP NOT NULL;

-- Verify changes
SELECT 
    table_name,
    column_name,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'created_by'
ORDER BY table_name;

-- This query should show 'YES' for is_nullable for all created_by columns
