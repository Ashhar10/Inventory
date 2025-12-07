# 🔧 Database Migration Guide

## Problem
You're getting this error:
```
Error saving customer: insert or update on table "customers" violates foreign key constraint "customers_created_by_fkey"
```

This happens because your logged-in user exists in Supabase Auth but NOT in the `public.users` table.

---

## ✅ Solution: Make created_by Fields Optional

Run the migration SQL to make the `created_by` fields nullable (optional).

### Step 1: Run the Migration

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `fix_foreign_keys.sql` from your project
5. Copy ALL the content
6. Paste into Supabase SQL Editor
7. Click **Run** or press `Ctrl + Enter`

You should see: **"Success. No rows returned"** (this is normal!)

### Step 2: Verify the Fix

After running the migration:
1. Refresh your deployed app (Vercel/Render)
2. Try adding a new customer
3. It should work now! ✅

---

## 🎯 What This Does

The migration makes these fields OPTIONAL (nullable):
- `customers.created_by`
- `products.created_by`
- `orders.created_by`
- `sales.created_by`
- `inventory_movements.created_by`
- `inventory.updated_by`
- `packing.packed_by`

This means:
- ✅ App works even if user isn't in `public.users` table
- ✅ No more foreign key errors
- ✅ When user DOES exist in users table, it still tracks who created records
- ✅ backwards compatible with existing data

---

## 🔐 Optional: Add Your User to the Users Table

If you want to track who creates records, you can add your user:

1. In Supabase, go to **Authentication** → **Users**
2. Find your user and copy the **User ID** (UUID)
3. Go to **SQL Editor** and run:

```sql
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  'YOUR-USER-ID-HERE',  -- Replace with your actual user ID
  'your-email@example.com',  -- Your email
  'Your Full Name',  -- Your name
  'admin'  -- Or 'manager', 'staff', 'user'
)
ON CONFLICT (id) DO NOTHING;
```

After this, the app will track that YOU created the customers/products!

---

## ✅ Done!

Run the migration and your app will work perfectly! 🎉
