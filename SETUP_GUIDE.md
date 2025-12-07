# 🚀 Complete Setup Guide - Pakistan Wire Industries Inventory System

This guide will walk you through setting up the inventory system from scratch. Follow each step carefully.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- ✅ Node.js 16+ installed ([Download here](https://nodejs.org/))
- ✅ A code editor (VS Code recommended)
- ✅ A web browser (Chrome, Edge, or Firefox)
- ✅ Internet connection
- ✅ A Supabase account (free - we'll create this together)

---

## 🎯 Step 1: Create Supabase Account & Project

### 1.1 Sign Up for Supabase

1. Go to **[https://supabase.com](https://supabase.com)**
2. Click **"Start your project"** or **"Sign In"**
3. Sign up using:
   - GitHub account (recommended - fastest), OR
   - Email & password

### 1.2 Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in the project details:
   - **Name**: `pakistan-wire-inventory` (or any name you like)
   - **Database Password**: Create a STRONG password and **SAVE IT SECURELY**
   - **Region**: Choose closest to Pakistan (e.g., `Southeast Asia (Singapore)` or `ap-southeast-1`)
   - **Pricing Plan**: Select **FREE**
3. Click **"Create new project"**
4. ⏳ Wait 2-3 minutes for your database to initialize

---

## 🔑 Step 2: Get Your Supabase Credentials

### 2.1 Navigate to API Settings

1. In your Supabase project dashboard, look at the **left sidebar**
2. Click on the **⚙️ Settings** icon (at the bottom)
3. In the Settings menu, click **"API"**

### 2.2 Copy Your Credentials

You'll see a page with two important values:

#### A) Project URL
- Look for **"Project URL"** section
- Copy the entire URL (starts with `https://`)
- Should look like: `https://xyzabc123def.supabase.co`
- ⚠️ **IMPORTANT**: Copy the FULL URL including `https://`

#### B) API Keys
- Scroll down to **"Project API keys"** section
- Find the **"anon public"** key
- Click the **copy icon** next to it
- This is a VERY LONG string starting with `eyJ...`
- ⚠️ **IMPORTANT**: Copy the ENTIRE key (it's about 400+ characters long)

### 2.3 Save These Values

Keep these values handy - you'll need them in the next step!

---

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Open the `.env` File

1. In your code editor, navigate to: `f:\Inventory\Web\Inventory\`
2. Open the `.env` file (NOT `.env.example`)
3. If `.env` doesn't exist, copy `.env.example` and rename it to `.env`

### 3.2 Update the Values

Replace the placeholder values with your Supabase credentials:

**BEFORE (Incorrect - Placeholders):**
```env
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder-anon-key-replace-this-with-real-key
```

**AFTER (Correct - Your Real Values):**
```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_LONG_KEY_HERE...
```

**Example (with fake values for reference):**
```env
VITE_SUPABASE_URL=https://bvuxoyomjjhkhnbyunz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dXhveW9tampoa2huYnl1bnoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwNTQzMjgwMCwiZXhwIjoyMDIxMDA4ODAwfQ.r5xW_z8kJ9mN2pQ3vT6yU7aB1cD4eF5gH6iJ7kL8mN9o
```

### 3.3 Save the File

- Press `Ctrl + S` to save
- ✅ Your environment is now configured!

---

## 🗄️ Step 4: Setup the Database

### 4.1 Open SQL Editor in Supabase

1. Back in your Supabase dashboard
2. Click on **🔧 SQL Editor** in the left sidebar
3. Click **"New Query"** button

### 4.2 Run the Database Schema

1. In your code editor, open: `f:\Inventory\Web\Inventory\schema.sql`
2. Select ALL the content (`Ctrl + A`)
3. Copy it (`Ctrl + C`)
4. Go back to Supabase SQL Editor
5. Paste the entire content (`Ctrl + V`)
6. Click **"Run"** or press `Ctrl + Enter`
7. ⏳ Wait 10-20 seconds for it to complete
8. You should see: **"Success. No rows returned"** (this is normal!)

### 4.3 Verify Tables Were Created

1. In Supabase, click **📊 Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ users
   - ✅ customers
   - ✅ products
   - ✅ inventory
   - ✅ orders
   - ✅ order_items
   - ✅ sales
   - ✅ packing
   - ✅ packing_items
   - ✅ stores
   - ✅ inventory_movements

---

## 👤 Step 5: Create Admin User

### 5.1 Create User in Authentication

1. In Supabase, click **🔐 Authentication** in the left sidebar
2. Click on **"Users"** tab
3. Click **"Add user"** → **"Create new user"**
4. Fill in:
   - **Email**: `admin@pakistanwire.com`
   - **Password**: `Admin@123` (or choose your own)
   - **Auto Confirm User**: ✅ YES (important!)
5. Click **"Create user"**
6. **IMPORTANT**: Copy the **User ID** (UUID) displayed - you'll need it!

### 5.2 Add User to the Users Table

1. Go back to **🔧 SQL Editor**
2. Click **"New Query"**
3. Paste this SQL (replace `YOUR-USER-ID-HERE` with the UUID you copied):

```sql
INSERT INTO public.users (id, email, full_name, role)
VALUES ('YOUR-USER-ID-HERE', 'admin@pakistanwire.com', 'Admin User', 'admin');
```

**Example:**
```sql
INSERT INTO public.users (id, email, full_name, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin@pakistanwire.com', 'Admin User', 'admin');
```

4. Click **"Run"**
5. You should see: **"Success. 1 row affected"**

---

## 🚀 Step 6: Run the Application

### 6.1 Install Dependencies (If Not Done)

Open terminal/PowerShell in `f:\Inventory\Web\Inventory\`:

```bash
npm install
```

Wait for installation to complete.

### 6.2 Start Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.4.21  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.X.X:3000/
```

### 6.3 Open in Browser

1. Open your browser
2. Go to: **http://localhost:3000**
3. You should see the beautiful login page! 🎉

---

## 🔐 Step 7: Login & Test

### 7.1 Login

Use the credentials you created:
- **Email**: `admin@pakistanwire.com`
- **Password**: `Admin@123` (or your chosen password)

### 7.2 Explore the Dashboard

After login, you should see:
- 🏭 Pakistan Wire Industries Dashboard
- 3D Interactive Cards for each module
- Quick statistics at the top
- Beautiful gradient background with animations

### 7.3 Test Features

Click on each card to explore:
- 👥 **Customers** - Add/Edit/Delete customers
- 📦 **Products** - Manage product catalog
- 🏢 **Inventory** - View stock levels
- 📋 **Orders** - Track orders
- 💰 **Sales** - View sales data
- 📊 **Reports** - See analytics

---

## ✅ Verification Checklist

Make sure everything works:

- [ ] Login page loads without errors
- [ ] Can login with admin credentials
- [ ] Dashboard shows 3D cards with animations
- [ ] Can navigate to all pages (Customers, Products, etc.)
- [ ] Can add a new customer
- [ ] Can add a new product
- [ ] No console errors in browser (press F12 → Console tab)

---

## 🐛 Troubleshooting

### Problem: "Invalid supabaseUrl" error

**Solution:**
- Check that `VITE_SUPABASE_URL` starts with `https://`
- Check that you copied the FULL URL from Supabase

### Problem: Login doesn't work

**Solutions:**
1. Check that admin user exists in **Authentication → Users**
2. Check that user record exists in **users** table
3. Verify the password is correct
4. Check browser console for errors (F12)

### Problem: Blank page or white screen

**Solutions:**
1. Stop the dev server (`Ctrl + C`)
2. Delete `.env` file
3. Copy `.env.example` to `.env`
4. Re-enter your Supabase credentials
5. Restart: `npm run dev`

### Problem: "Row Level Security" errors

**Solution:**
- Make sure you ran the ENTIRE `schema.sql` file
- The RLS policies should be automatically created
- Try re-running the schema

### Problem: Tables not showing data

**Solutions:**
1. The app starts with sample data (2 stores, 5 products, 3 customers)
2. If data is missing, re-run the `schema.sql` file
3. Or manually add data through the UI

---

## 🎨 What You Should See

### Login Page
- Pakistan Wire Industries branding
- Animated gradient background
- Glassmorphic login card
- Demo credentials displayed

### Dashboard
- 8 colorful 3D cards
- Quick stats (Customers, Products, Orders, Sales)
- Smooth hover animations
- Cards lift and glow on hover

### Management Pages
- Clean table views
- Search and pagination
- Add/Edit/Delete buttons
- Modal forms for data entry

---

## 📝 Next Steps

Once everything is working:

1. **Customize the data** - Add your real products and customers
2. **Change admin password** - For security
3. **Create additional users** - Add staff members
4. **Explore all features** - Test each module
5. **Deploy to production** - Follow `DEPLOYMENT.md` when ready

---

## 🆘 Still Need Help?

If you're stuck:

1. Check the **README.md** file for more details
2. Check **DEPLOYMENT.md** for deployment-specific issues
3. Review the **Supabase documentation**: https://supabase.com/docs
4. Make sure all steps above were followed exactly

---

## 🎉 Congratulations!

You now have a fully functional, modern inventory management system running! 

**Enjoy using Pakistan Wire Industries Inventory Dashboard!** 🏭✨
