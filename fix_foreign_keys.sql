-- Migration to fix foreign key constraints
-- This makes created_by fields OPTIONAL (nullable) so users don't need to exist in users table

-- Make created_by nullable in customers table
ALTER TABLE public.customers 
ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable in products table
ALTER TABLE public.products 
ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable in orders table
ALTER TABLE public.orders 
ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable in sales table
ALTER TABLE public.sales 
ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable in inventory_movements table
ALTER TABLE public.inventory_movements 
ALTER COLUMN created_by DROP NOT NULL;

-- Make updated_by nullable in inventory table  
ALTER TABLE public.inventory 
ALTER COLUMN updated_by DROP NOT NULL;

-- Make packed_by nullable in packing table
ALTER TABLE public.packing 
ALTER COLUMN packed_by DROP NOT NULL;

-- Note: The foreign key constraints remain, but now these fields can be NULL
-- This allows the app to work even when users aren't in the public.users table
