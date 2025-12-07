-- Pakistan Wire Industries (Pvt.) LTD - Inventory Management System
-- Database Schema with Custom Authentication (No Supabase Auth)

-- =============================================
-- EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABLES
-- =============================================

-- Users Table (Custom Authentication - No Supabase Auth Dependency)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'staff', 'user')),
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores/Warehouses Table
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    manager_name TEXT,
    contact_phone TEXT,
    capacity NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Pakistan',
    credit_limit NUMERIC(15, 2) DEFAULT 0,
    current_balance NUMERIC(15, 2) DEFAULT 0,
    payment_terms TEXT DEFAULT 'Cash',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    unit_of_measure TEXT DEFAULT 'PCS',
    unit_price NUMERIC(15, 2) NOT NULL,
    cost_price NUMERIC(15, 2),
    reorder_level INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    location_bin TEXT,
    last_stock_date TIMESTAMP WITH TIME ZONE,
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, store_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled')),
    total_amount NUMERIC(15, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    discount_amount NUMERIC(15, 2) DEFAULT 0,
    grand_total NUMERIC(15, 2) GENERATED ALWAYS AS (total_amount + tax_amount - discount_amount) STORED,
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    line_total NUMERIC(15, 2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100)) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    order_id UUID REFERENCES public.orders(id),
    customer_id UUID REFERENCES public.customers(id),
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_amount NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) DEFAULT 0,
    balance NUMERIC(15, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'credit')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packing Table
CREATE TABLE IF NOT EXISTS public.packing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    packing_slip_number TEXT UNIQUE NOT NULL,
    order_id UUID REFERENCES public.orders(id),
    store_id UUID REFERENCES public.stores(id),
    packed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    packed_by UUID REFERENCES public.users(id),
    total_packages INTEGER DEFAULT 1,
    total_weight NUMERIC(10, 2),
    shipping_method TEXT,
    tracking_number TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'packed', 'shipped', 'delivered')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packing Items Table
CREATE TABLE IF NOT EXISTS public.packing_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    packing_id UUID REFERENCES public.packing(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    package_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Movements Table (for audit trail)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id),
    store_id UUID REFERENCES public.stores(id),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'transfer')),
    quantity INTEGER NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_customers_customer_code ON public.customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_store_id ON public.inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_packing_order_id ON public.packing(order_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stores_updated_at ON public.stores;
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.inventory;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_packing_updated_at ON public.packing;
CREATE TRIGGER update_packing_updated_at BEFORE UPDATE ON public.packing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies (if any)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view stores" ON public.stores;
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can manage sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can view packing" ON public.packing;
DROP POLICY IF EXISTS "Authenticated users can manage packing" ON public.packing;
DROP POLICY IF EXISTS "Authenticated users can view packing items" ON public.packing_items;
DROP POLICY IF EXISTS "Authenticated users can manage packing items" ON public.packing_items;
DROP POLICY IF EXISTS "Authenticated users can view inventory movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "Authenticated users can create inventory movements" ON public.inventory_movements;

-- Create permissive policies (authentication handled on client side)
-- Note: In a production environment, you should implement proper service role authentication
-- For now, we'll allow all operations (RLS is enabled but policies are permissive for authenticated service role)

CREATE POLICY "Allow all operations on users" ON public.users
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on stores" ON public.stores
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on customers" ON public.customers
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on products" ON public.products
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on inventory" ON public.inventory
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on orders" ON public.orders
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on order_items" ON public.order_items
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on sales" ON public.sales
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on packing" ON public.packing
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on packing_items" ON public.packing_items
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on inventory_movements" ON public.inventory_movements
    FOR ALL USING (true);

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default admin user with bcrypt hashed password
-- Password: Admin@123
-- Hash generated with bcrypt, cost factor 10
INSERT INTO public.users (email, password_hash, full_name, role, is_active)
VALUES (
    'admin@pakistanwire.com',
    '$2a$10$gTpkAv.ZiXg4aov6gR04tuRvEHhDQSMWlnlZG9ce4OMGLAUW1icte',
    'Admin User',
    'admin',
    true
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Insert default stores
INSERT INTO public.stores (name, location, address, manager_name, contact_phone, capacity)
VALUES 
    ('Main Warehouse', 'Karachi', '123 Industrial Area, Karachi, Pakistan', 'Ahmed Khan', '+92-300-1234567', 10000),
    ('Secondary Warehouse', 'Lahore', '456 Manufacturing Zone, Lahore, Pakistan', 'Bilal Ahmed', '+92-301-7654321', 5000)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO public.products (sku, name, description, category, unit_of_measure, unit_price, cost_price, reorder_level)
VALUES 
    ('WIRE-001', 'Galvanized Wire 2.5mm', 'High-quality galvanized wire for industrial use', 'Galvanized Wire', 'KG', 250.00, 180.00, 100),
    ('WIRE-002', 'Galvanized Wire 3.0mm', 'Heavy duty galvanized wire', 'Galvanized Wire', 'KG', 275.00, 200.00, 100),
    ('WIRE-003', 'Barbed Wire 12 Gauge', 'Security barbed wire fencing', 'Barbed Wire', 'ROLL', 3500.00, 2800.00, 50),
    ('WIRE-004', 'Chain Link Fence 6ft', 'Commercial chain link fencing', 'Chain Link', 'ROLL', 8500.00, 7000.00, 25),
    ('WIRE-005', 'Steel Wire Rope 6mm', 'Heavy duty steel wire rope', 'Wire Rope', 'METER', 450.00, 350.00, 200)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample customers
INSERT INTO public.customers (customer_code, name, company_name, email, phone, address, city, credit_limit, payment_terms)
VALUES 
    ('CUST-001', 'Muhammad Ali', 'Ali Construction Ltd', 'ali@construction.com', '+92-300-1111111', 'Plot 45, DHA Phase 5', 'Karachi', 500000, 'Net 30'),
    ('CUST-002', 'Fatima Enterprises', 'Fatima Trading Co', 'info@fatima.com', '+92-301-2222222', 'Main Boulevard, Gulberg', 'Lahore', 300000, 'Net 15'),
    ('CUST-003', 'Zubair Khan', 'Khan Industries', 'zubair@khan.com', '+92-333-3333333', 'Industrial Estate, SITE', 'Karachi', 750000, 'Net 45')
ON CONFLICT (customer_code) DO NOTHING;
