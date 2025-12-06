# Pakistan Wire Industries (Pvt.) LTD
# Inventory Management System 🏭

A modern, interactive inventory management system built with React, Supabase, and stunning 3D UI effects.

![Dashboard Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=Pakistan+Wire+Industries+Dashboard)

## ✨ Features

- 🔐 **Secure Authentication** - Supabase Auth integration
- 👥 **Customer Management** - Track customers, credit limits, and balances
- 📦 **Product Management** - Manage products, SKUs, and pricing
- 🏢 **Inventory Tracking** - Real-time stock levels and low stock alerts
- 📋 **Order Management** - Complete order lifecycle tracking
- 💰 **Sales Tracking** - Revenue monitoring and payment status
- 📊 **Reports & Analytics** - Business insights and key metrics
- 🎨 **Modern UI** - 3D cards, glassmorphism, and smooth animations
- 📱 **Responsive Design** - Works on all devices

## 🚀 Tech Stack

- **Frontend:** React 18, Vite
- **Backend:** Supabase (PostgreSQL)
- **Styling:** Custom CSS with modern effects
- **Routing:** React Router v6
- **Deployment:** Render

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 16+ installed
- A Supabase account ([Sign up here](https://supabase.com))
- Git installed

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd pakistan-wire-inventory
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

#### Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready

#### Run the SQL Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor** → **New Query**
3. Copy the entire contents of `schema.sql`
4. Paste it into the SQL editor
5. Click **Run** to execute

#### Create Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Email: `admin@pakistanwire.com`
4. Password: `Admin@123` (or your preferred password)
5. Click **Create User**
6. Copy the User ID from the users table

7. Go back to **SQL Editor** and run:

```sql
INSERT INTO public.users (id, email, full_name, role)
VALUES ('YOUR-USER-ID-HERE', 'admin@pakistanwire.com', 'Admin User', 'admin');
```

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

2. Get your Supabase credentials:
   - Go to **Project Settings** → **API**
   - Copy **Project URL** and **anon public** key

3. Update `.env`:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_ENV=development
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and login with:
- Email: `admin@pakistanwire.com`
- Password: `Admin@123`

## 🌐 Deployment to Render

### Method 1: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Static Site**
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml`
6. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
7. Click **Create Static Site**

### Method 2: Manual Setup

1. On Render Dashboard, click **New** → **Static Site**
2. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Add environment variables (same as above)
4. Click **Create Static Site**

Your app will be deployed to: `https://your-app-name.onrender.com`

## 📁 Project Structure

```
pakistan-wire-inventory/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TableView.jsx
│   │   └── Form.jsx
│   ├── pages/            # Application pages
│   │   ├── Login.jsx
│   │   ├── Dashboard.js
│   │   ├── Products.jsx
│   │   ├── Inventory.jsx
│   │   ├── Orders.jsx
│   │   ├── Customers.jsx
│   │   ├── Sales.jsx
│   │   └── Reports.jsx
│   ├── supabase/         # Supabase configuration
│   │   └── client.js
│   ├── App.jsx           # Main app component
│   ├── index.js          # Entry point
│   └── index.css         # Global styles
├── schema.sql            # Database schema
├── package.json
├── vite.config.js
├── render.yaml           # Render deployment config
└── README.md
```

## 🎨 Design Features

- **3D Interactive Cards** - Cards that lift and rotate on hover
- **Glassmorphism Effects** - Modern frosted glass UI elements
- **Smooth Animations** - Fade-in, slide, and bounce effects
- **Gradient Backgrounds** - Beautiful animated gradients
- **Responsive Tables** - Mobile-friendly data tables
- **Loading States** - Elegant loading spinners

## 📊 Database Schema

The system includes the following tables:

- `users` - User profiles and roles
- `customers` - Customer information
- `products` - Product catalog
- `inventory` - Stock levels by store
- `orders` - Order management
- `order_items` - Order line items
- `sales` - Sales transactions
- `packing` - Packing slips
- `stores` - Warehouse locations
- `inventory_movements` - Stock movement audit trail

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Supabase Auth integration
- Secure API calls with authentication
- Environment variables for sensitive data

## 🤝 Contributing

This is a custom project for Pakistan Wire Industries (Pvt.) LTD. For modifications or issues, please contact the development team.

## 📝 License

Copyright © 2024 Pakistan Wire Industries (Pvt.) LTD. All rights reserved.

## 🆘 Support & Troubleshooting

### Common Issues

**Login not working:**
- Ensure you've created the admin user in Supabase Auth
- Verify the user record exists in the `users` table
- Check environment variables are correctly set

**Database errors:**
- Ensure `schema.sql` was executed successfully
- Verify RLS policies are enabled
- Check Supabase project is active

**Build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm run build --force`

### Contact

For support, please contact your system administrator.

---

Made with ❤️ for Pakistan Wire Industries (Pvt.) LTD
