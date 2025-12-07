import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Session storage key
const SESSION_KEY = 'pwi_auth_session'

// Custom Authentication helpers (no Supabase Auth)
export const auth = {
    signIn: async (email, password) => {
        try {
            // Query the users table to find user by email
            const { data: users, error: queryError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase())
                .eq('is_active', true)
                .limit(1)

            if (queryError) {
                console.error('Database query error:', queryError)
                return { data: null, error: { message: 'Database error occurred' } }
            }

            if (!users || users.length === 0) {
                return { data: null, error: { message: 'Invalid email or password' } }
            }

            const user = users[0]

            // Verify password using bcrypt
            const passwordMatch = await bcrypt.compare(password, user.password_hash)

            if (!passwordMatch) {
                return { data: null, error: { message: 'Invalid email or password' } }
            }

            // Create session object (excluding password_hash)
            const { password_hash, ...userWithoutPassword } = user
            const session = {
                user: userWithoutPassword,
                access_token: `custom_token_${user.id}_${Date.now()}`,
                expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
            }

            // Store session in localStorage
            localStorage.setItem(SESSION_KEY, JSON.stringify(session))

            // Dispatch custom event for auth state listeners
            window.dispatchEvent(new CustomEvent('authStateChange', { detail: { session } }))

            return { data: { user: userWithoutPassword, session }, error: null }
        } catch (error) {
            console.error('Sign in error:', error)
            return { data: null, error: { message: 'An unexpected error occurred' } }
        }
    },

    signOut: async () => {
        try {
            // Clear session from localStorage
            localStorage.removeItem(SESSION_KEY)

            // Dispatch custom event for auth state listeners
            window.dispatchEvent(new CustomEvent('authStateChange', { detail: { session: null } }))

            return { error: null }
        } catch (error) {
            console.error('Sign out error:', error)
            return { error: { message: 'Failed to sign out' } }
        }
    },

    getCurrentUser: async () => {
        try {
            const sessionStr = localStorage.getItem(SESSION_KEY)
            if (!sessionStr) return null

            const session = JSON.parse(sessionStr)

            // Check if session is expired
            if (session.expires_at && session.expires_at < Date.now()) {
                localStorage.removeItem(SESSION_KEY)
                return null
            }

            return session.user
        } catch (error) {
            console.error('Get current user error:', error)
            return null
        }
    },

    getSession: async () => {
        try {
            const sessionStr = localStorage.getItem(SESSION_KEY)
            if (!sessionStr) return null

            const session = JSON.parse(sessionStr)

            // Check if session is expired
            if (session.expires_at && session.expires_at < Date.now()) {
                localStorage.removeItem(SESSION_KEY)
                return null
            }

            return session
        } catch (error) {
            console.error('Get session error:', error)
            return null
        }
    },

    onAuthStateChange: (callback) => {
        // Custom event listener for auth state changes
        const handler = (event) => {
            const session = event.detail.session
            callback('SIGNED_IN', session)
        }

        window.addEventListener('authStateChange', handler)

        // Return subscription object similar to Supabase
        return {
            data: {
                subscription: {
                    unsubscribe: () => {
                        window.removeEventListener('authStateChange', handler)
                    }
                }
            }
        }
    },

    // Helper to hash passwords (for future user creation)
    hashPassword: async (password) => {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)
    }
}

// Database helpers (unchanged - still use Supabase for data operations)
export const db = {
    // Customers
    getCustomers: async () => {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false })
        return { data, error }
    },

    createCustomer: async (customerData) => {
        // Get current user for created_by field
        const currentUser = await auth.getCurrentUser()
        const dataWithCreator = {
            ...customerData,
            created_by: currentUser?.id
        }

        const { data, error } = await supabase
            .from('customers')
            .insert([dataWithCreator])
            .select()
        return { data, error }
    },

    updateCustomer: async (id, customerData) => {
        const { data, error } = await supabase
            .from('customers')
            .update(customerData)
            .eq('id', id)
            .select()
        return { data, error }
    },

    deleteCustomer: async (id) => {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id)
        return { error }
    },

    // Products
    getProducts: async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
        return { data, error }
    },

    createProduct: async (productData) => {
        // Get current user for created_by field
        const currentUser = await auth.getCurrentUser()
        const dataWithCreator = {
            ...productData,
            created_by: currentUser?.id
        }

        const { data, error } = await supabase
            .from('products')
            .insert([dataWithCreator])
            .select()
        return { data, error }
    },

    updateProduct: async (id, productData) => {
        const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)
            .select()
        return { data, error }
    },

    deleteProduct: async (id) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
        return { error }
    },

    // Inventory
    getInventory: async () => {
        const { data, error } = await supabase
            .from('inventory')
            .select(`
        *,
        product:products(*),
        store:stores(*)
      `)
            .order('updated_at', { ascending: false })
        return { data, error }
    },

    updateInventory: async (id, inventoryData) => {
        // Get current user for updated_by field
        const currentUser = await auth.getCurrentUser()
        const dataWithUpdater = {
            ...inventoryData,
            updated_by: currentUser?.id
        }

        const { data, error } = await supabase
            .from('inventory')
            .update(dataWithUpdater)
            .eq('id', id)
            .select()
        return { data, error }
    },

    // Orders
    getOrders: async () => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        customer:customers(*),
        order_items(*, product:products(*))
      `)
            .order('order_date', { ascending: false })
        return { data, error }
    },

    createOrder: async (orderData, orderItems) => {
        // Get current user for created_by field
        const currentUser = await auth.getCurrentUser()
        const dataWithCreator = {
            ...orderData,
            created_by: currentUser?.id
        }

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([dataWithCreator])
            .select()
            .single()

        if (orderError) return { data: null, error: orderError }

        // Create order items
        const itemsWithOrderId = orderItems.map(item => ({
            ...item,
            order_id: order.id,
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsWithOrderId)

        if (itemsError) {
            // Rollback order if items failed
            await supabase.from('orders').delete().eq('id', order.id)
            return { data: null, error: itemsError }
        }

        return { data: order, error: null }
    },

    updateOrder: async (id, orderData) => {
        const { data, error } = await supabase
            .from('orders')
            .update(orderData)
            .eq('id', id)
            .select()
        return { data, error }
    },

    // Sales
    getSales: async () => {
        const { data, error } = await supabase
            .from('sales')
            .select(`
        *,
        customer:customers(*),
        order:orders(*)
      `)
            .order('sale_date', { ascending: false })
        return { data, error }
    },

    createSale: async (saleData) => {
        // Get current user for created_by field
        const currentUser = await auth.getCurrentUser()
        const dataWithCreator = {
            ...saleData,
            created_by: currentUser?.id
        }

        const { data, error } = await supabase
            .from('sales')
            .insert([dataWithCreator])
            .select()
        return { data, error }
    },

    // Packing
    getPacking: async () => {
        const { data, error } = await supabase
            .from('packing')
            .select(`
        *,
        order:orders(*),
        store:stores(*),
        packing_items(*, product:products(*))
      `)
            .order('packed_date', { ascending: false })
        return { data, error }
    },

    // Stores
    getStores: async () => {
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .order('name')
        return { data, error }
    },

    // Reports & Analytics
    getDashboardStats: async () => {
        // Get total customers
        const { count: customersCount } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })

        // Get total products
        const { count: productsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })

        // Get pending orders
        const { count: pendingOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .in('status', ['pending', 'confirmed', 'processing'])

        // Get total sales this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { data: salesData } = await supabase
            .from('sales')
            .select('total_amount')
            .gte('sale_date', startOfMonth.toISOString())

        const totalSales = salesData?.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0) || 0

        return {
            customers: customersCount || 0,
            products: productsCount || 0,
            pendingOrders: pendingOrders || 0,
            salesThisMonth: totalSales,
        }
    },
}

export default supabase
