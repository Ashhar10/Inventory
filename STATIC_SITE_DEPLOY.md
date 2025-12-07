# 🚀 Static Site Deployment Guide - Render

## Step-by-Step Instructions to Deploy as Static Site

### Step 1: Delete Existing Web Service (If Any)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your current service (pakistan-wire-inventory)
3. Click on the service name
4. Scroll down to **Settings** → **Danger Zone**
5. Click **Delete Web Service**
6. Confirm deletion

---

### Step 2: Create New Static Site

1. On Render Dashboard, click **New +** button
2. Select **Static Site**

#### Connect Repository

3. Click **Connect a repository**
4. If not already connected:
   - Click **Connect GitHub**
   - Authorize Render to access your repositories
5. Find and select your repository: `Ashhar10/Inventory` (or your repo name)
6. Click **Connect**

---

### Step 3: Configure Static Site

Fill in these settings:

#### Basic Settings

- **Name**: `pakistan-wire-inventory` (or any name you prefer)
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (unless your code is in a subdirectory)

#### Build Settings

- **Build Command**: 
  ```bash
  npm install && npm run build
  ```

- **Publish Directory**:
  ```
  dist
  ```

#### Advanced Settings (Click "Advanced")

- **Auto-Deploy**: ✅ Yes (keep checked)

---

### Step 4: Add Environment Variables

Scroll down to **Environment Variables** section:

1. Click **Add Environment Variable**

2. Add first variable:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: `your-supabase-project-url` (e.g., https://xyz.supabase.co)

3. Click **Add Environment Variable** again

4. Add second variable:
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `your-supabase-anon-key` (the long JWT token)

---

### Step 5: Create Static Site

1. Click **Create Static Site** button at the bottom
2. ⏳ Wait for deployment (2-3 minutes)

---

### Step 6: Monitor Deployment

You'll see the build logs in real-time:

**Expected output:**
```
==> Cloning repository...
==> Installing dependencies...
==> Building...
vite v5.4.21 building for production...
✓ 145 modules transformed.
dist/index.html                     1.08 kB │ gzip:  0.54 kB
dist/assets/index-M-pbCADW.css     11.58 kB │ gzip:  3.04 kB
dist/assets/index-CMfbi0Qw.js      38.66 kB │ gzip:  8.88 kB
dist/assets/vendor-CPVkQQq5.js    162.84 kB │ gzip: 53.13 kB
dist/assets/supabase-De5erQBy.js  190.85 kB │ gzip: 49.58 kB
✓ built in XX.XXs
==> Uploading...
==> Deploy successful! 🎉
```

---

### Step 7: Access Your Site

1. Once deployed, you'll see: **"Your site is live"** 🎉
2. Click the URL (e.g., `https://pakistan-wire-inventory.onrender.com`)
3. Your inventory system should load!

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Site loads without errors
- [ ] Login page appears with beautiful UI
- [ ] No "Invalid Supabase URL" errors in console
- [ ] Can login with admin credentials
- [ ] Dashboard loads with 3D cards
- [ ] All pages are accessible

---

## 🐛 Troubleshooting

### Issue: "Invalid Supabase URL" error

**Fix:**
- Double-check environment variables in Render
- Make sure `VITE_SUPABASE_URL` includes `https://`
- Verify the anon key is complete (very long string)

### Issue: 404 errors on page refresh

**Fix:**
- This is already handled by render.yaml
- The rewrite rules redirect all routes to index.html

### Issue: Build fails

**Check:**
- Build command is: `npm install && npm run build`
- Publish directory is: `dist`
- All environment variables are set

---

## 🎯 After Successful Deployment

1. **Test the site thoroughly**
2. **Bookmark your Render URL**
3. **Set up custom domain** (optional, in Render settings)
4. **Monitor via Render dashboard**

Your site will:
- ✅ Auto-deploy on every git push
- ✅ Be available 24/7 with zero downtime
- ✅ Load instantly (no cold starts)
- ✅ Stay free forever

---

## 📝 Important URLs

- **Render Dashboard**: https://dashboard.render.com
- **Your Site**: https://pakistan-wire-inventory.onrender.com
- **Supabase**: https://supabase.com/dashboard

---

## 🎉 Success!

Once you see "Your site is live", you're done! The inventory system is now deployed and accessible worldwide.

**Next Steps:**
- Share the URL with your team
- Add real customer and product data
- Monitor usage in Render dashboard
