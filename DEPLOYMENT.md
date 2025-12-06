# DEPLOYMENT GUIDE
# Pakistan Wire Industries Inventory System

## Quick Start Checklist

### 1. Database Setup (Supabase)
- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project
- [ ] Copy Project URL and anon key
- [ ] Run schema.sql in SQL Editor
- [ ] Create admin user in Authentication
- [ ] Insert admin user record in users table

### 2. Local Development
- [ ] Copy .env.example to .env
- [ ] Add Supabase credentials to .env
- [ ] Run: npm install
- [ ] Run: npm run dev
- [ ] Test login with admin credentials

### 3. Deployment (Render)
- [ ] Push code to GitHub
- [ ] Create account at https://render.com
- [ ] Create new Static Site
- [ ] Connect GitHub repository
- [ ] Add environment variables
- [ ] Deploy!

## Detailed Steps

### Database Setup

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose organization and region
   - Set database password (save this!)
   - Wait for project to initialize

2. **Execute SQL Schema:**
   - In Supabase dashboard, go to SQL Editor
   - Create new query
   - Paste entire schema.sql content
   - Click RUN (takes ~30 seconds)
   - Verify tables created in Table Editor

3. **Create Admin User:**
   - Go to Authentication → Users
   - Click "Add User"
   - Email: admin@pakistanwire.com
   - Password: Admin@123
   - Confirm email: YES
   - Copy the User ID

4. **Add User Profile:**
   - Go to SQL Editor
   - Run this query (replace USER-ID):
   ```sql
   INSERT INTO public.users (id, email, full_name, role)
   VALUES ('paste-user-id-here', 'admin@pakistanwire.com', 'Admin User', 'admin');
   ```

5. **Get API Credentials:**
   - Go to Settings → API
   - Copy "Project URL"
   - Copy "anon public" key

### Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   ```bash
   copy .env.example .env
   ```
   
   Edit .env:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_APP_ENV=development
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Test Application:**
   - Open http://localhost:3000
   - Login with admin@pakistanwire.com / Admin@123
   - Verify dashboard loads
   - Test each module (Customers, Products, etc.)

### Production Deployment (Render)

1. **Prepare Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create Render Account:**
   - Go to https://render.com
   - Sign up with GitHub

3. **Deploy Static Site:**
   - Click "New +" → "Static Site"
   - Connect GitHub repository
   - Render auto-detects render.yaml
   - Name: pakistan-wire-inventory
   - Branch: main

4. **Add Environment Variables:**
   - Scroll to "Environment Variables"
   - Add:
     - VITE_SUPABASE_URL = your-supabase-url
     - VITE_SUPABASE_ANON_KEY = your-anon-key
   - Click "Create Static Site"

5. **Wait for Deployment:**
   - Build takes 2-5 minutes
   - Watch build logs for errors
   - Once complete, click the URL

6. **Test Production:**
   - Visit your Render URL
   - Test login
   - Verify all features work

## Environment Variables Reference

### Required
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Optional
- `VITE_APP_ENV` - Environment (development/production)

## Troubleshooting

### "Cannot connect to Supabase"
- Verify VITE_SUPABASE_URL is correct
- Verify VITE_SUPABASE_ANON_KEY is correct
- Check Supabase project is active

### "Login failed"
- Ensure admin user exists in Auth
- Ensure user record exists in users table
- Check RLS policies are enabled

### Build errors on Render
- Check package.json has correct dependencies
- Verify vite.config.js exists
- Check build logs for specific errors

### Pages not loading (404)
- Verify render.yaml has correct routing
- Ensure staticPublishPath is ./dist
- Check rewrite rule is configured

## Post-Deployment

### Security
1. Change admin password immediately
2. Create additional users as needed
3. Review RLS policies
4. Enable Supabase MFA (optional)

### Customization
1. Update company branding
2. Modify color scheme in index.css
3. Add custom reports
4. Configure email notifications (future)

### Monitoring
1. Check Render dashboard for uptime
2. Monitor Supabase usage
3. Review error logs regularly

## Support

For issues or questions:
1. Check this guide
2. Review README.md
3. Check Supabase documentation
4. Contact development team

---

🎉 Congratulations! Your inventory system is now deployed!
