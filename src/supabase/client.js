import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
})

// Authentication helpers
export const auth = {
    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    },

    getSession: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        return session
    },

    onAuthStateChange: (callback) => {
        return supabase.auth.onAuthStateChange(callback)
    },
}

// Database helpers
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
        const { data, error } = await supabase
            .from('customers')
            .insert([customerData])
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
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
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
        const { data, error } = await supabase
            .from('inventory')
            .update(inventoryData)
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
        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([orderData])
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
        const { data, error } = await supabase
            .from('sales')
            .insert([saleData])
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
