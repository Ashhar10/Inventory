# Custom Authentication Setup Guide

## ✅ Implementation Complete!

The Supabase authentication has been successfully replaced with a custom authentication system. Here's what was changed:

### Changes Made

1. **Database Schema** (`schema.sql`)
   - Created standalone `users` table with `password_hash` field
   - Removed dependency on Supabase `auth.users`
   - Updated all foreign keys to reference new `users` table
   - Modified RLS policies to work without `auth.uid()`
   - Added default admin user with bcrypt-hashed password

2. **Authentication Client** (`src/supabase/client.js`)
   - Replaced Supabase Auth with custom authentication
   - Implemented bcrypt password verification
   - Added localStorage-based session management
   - Custom auth state change event system
   - Updated all database helpers to include `created_by`/`updated_by`

3. **Frontend Components**
   - `src/pages/Login.jsx` - Updated to use custom auth
   - `src/App.jsx` - Updated to use custom session management
   - `src/components/Navbar.jsx` - No changes needed (already compatible)

4. **Dependencies**
   - Added `bcryptjs` for password hashing

## 🚀 Next Steps - Apply Database Schema

**IMPORTANT:** You need to apply the new database schema to your Supabase project:

### Option 1: Via Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Create a new query
4. Copy the entire contents of `schema.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute

### Option 2: Replace Existing Tables

If you have existing data you want to keep:

1. **Export your current data first!**
2. Go to Supabase Dashboard → Database → Tables
3. Manually drop the old `users` table
4. Run the new `schema.sql` via SQL Editor

### After Running Schema

The schema will create:
- ✅ New `users` table with password authentication
- ✅ Default admin user with credentials below
- ✅ All other tables (customers, products, orders, etc.)
- ✅ Sample data for testing

## 🔐 Default Admin Credentials

```
Email: admin@pakistanwire.com
Password: Admin@123
```

## 🧪 Testing the Application

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Test login**:
   - Navigate to the login page
   - Use the admin credentials above
   - Verify successful login and redirect to dashboard

4. **Test functionality**:
   - ✅ Add a new customer (verify `created_by` is set)
   - ✅ Add a new product
   - ✅ Check that data loads correctly
   - ✅ Test logout
   - ✅ Verify session persists after browser refresh

## 🔒 Security Notes

### Current Implementation
- Passwords are hashed with bcrypt (cost factor 10)
- Sessions stored in browser localStorage (7-day expiration)
- Client-side password verification
- RLS policies enabled (currently permissive for all authenticated operations)

### For Production
Consider implementing:
- Server-side password verification via backend API
- HTTP-only cookies instead of localStorage
- Stricter RLS policies based on user roles
- Rate limiting on login attempts
- Password reset functionality
- Multi-factor authentication

## 📝 Creating Additional Users

To create more users, you can:

1. **Via SQL Editor**:
   ```sql
   -- Generate a password hash first (use generate_hash.js)
   INSERT INTO public.users (email, password_hash, full_name, role)
   VALUES ('user@example.com', 'bcrypt_hash_here', 'User Name', 'user');
   ```

2. **Using the hash generator script**:
   ```bash
   node generate_hash.js
   ```
   Then use the generated hash in your INSERT statement.

## ❓ Troubleshooting

### Login fails with "Invalid email or password"
- Verify the schema was applied correctly
- Check that admin user exists: `SELECT * FROM users WHERE email = 'admin@pakistanwire.com';`
- Confirm password_hash field is populated

### "Database error occurred"
- Check browser console for detailed error messages
- Verify Supabase connection is working
- Check RLS policies are enabled

### Session not persisting
- Check browser localStorage (DevTools → Application → Local Storage)
- Look for key `pwi_auth_session`
- Verify session has valid `expires_at` timestamp

## 📂 Files Modified

- ✅ `schema.sql` - Complete database schema rewrite
- ✅ `package.json` - Added bcryptjs dependency
- ✅ `src/supabase/client.js` - Custom authentication implementation
- ✅ `src/pages/Login.jsx` - Updated to use custom auth
- ✅ `src/App.jsx` - Custom session management
- 📄 `generate_hash.js` - Utility script (can be deleted after setup)

## 🎉 You're All Set!

Once you've applied the schema to your Supabase database, your application will be using custom authentication instead of Supabase Auth. The user experience remains the same, but you now have full control over the authentication system!
