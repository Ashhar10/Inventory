# 🚨 URGENT FIX - Database Foreign Key Error

## Problem
Customers and Products cannot be added because of this error:
```
Error saving customer: insert or update on table "customers" violates foreign key constraint "customers_created_by_fkey"
```

## Root Cause
The `created_by` column requires a user ID that exists in the `users` table, but the logged-in user doesn't have a record there.

## ✅ SOLUTION - Run This SQL in Supabase

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy and Run This SQL

```sql
-- Make created_by columns nullable (allows NULL values)
ALTER TABLE customers ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE products ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE sales ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE packing ALTER COLUMN created_by DROP NOT NULL;
```

### Step 3: Click "Run" (or press Ctrl+Enter)

You should see: **"Success. No rows returned"**

## ✅ That's It!

After running this SQL:
- ✅ Customers can be added
- ✅ Products can be added 
- ✅ No more foreign key errors
- ✅ The `created_by` field will be NULL (which is fine)

## Alternative: Create User Record (Optional)

If you want to track who created records, you can also create a user record:

```sql
-- Get your current auth user ID first, then run:
INSERT INTO public.users (id, email, full_name, role)
VALUES ('YOUR-AUTH-USER-ID-HERE', 'your-email@example.com', 'Your Name', 'admin');
```

But the first solution (making it nullable) is simpler and works immediately!

---

## After Fixing

1. Run the SQL above in Supabase
2. Go back to your deployed app
3. Try adding a customer or product
4. It should work! ✅
