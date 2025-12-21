import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false
    }
})

const SESSION_KEY = 'pwi_auth_session'

// Safe storage helper
const safeStorage = {
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value)
        } catch (e) {
            console.warn('Storage access denied:', e)
        }
    },
    getItem: (key) => {
        try {
            return localStorage.getItem(key)
        } catch (e) {
            console.warn('Storage access denied:', e)
            return null
        }
    },
    removeItem: (key) => {
        try {
            localStorage.removeItem(key)
        } catch (e) {
            console.warn('Storage access denied:', e)
        }
    }
}

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
            safeStorage.setItem(SESSION_KEY, JSON.stringify(session))

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
            safeStorage.removeItem(SESSION_KEY)

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
            const sessionStr = safeStorage.getItem(SESSION_KEY)
            if (!sessionStr) return null

            const session = JSON.parse(sessionStr)

            // Check if session is expired
            if (session.expires_at && session.expires_at < Date.now()) {
                safeStorage.removeItem(SESSION_KEY)
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
            const sessionStr = safeStorage.getItem(SESSION_KEY)
            if (!sessionStr) return null

            const session = JSON.parse(sessionStr)

            // Check if session is expired
            if (session.expires_at && session.expires_at < Date.now()) {
                safeStorage.removeItem(SESSION_KEY)
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
    // Activity Logs
    getActivityLogs: async (limit = 100, filters = {}) => {
        let query = supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (filters.action_type) {
            query = query.eq('action_type', filters.action_type)
        }
        if (filters.entity_type) {
            query = query.eq('entity_type', filters.entity_type)
        }
        if (filters.user_id) {
            query = query.eq('user_id', filters.user_id)
        }

        const { data, error } = await query
        return { data, error }
    },

    createActivityLog: async (logData) => {
        const currentUser = await auth.getCurrentUser()
        const logEntry = {
            ...logData,
            user_id: currentUser?.id,
            user_name: currentUser?.full_name || 'Unknown User',
        }

        const { data, error } = await supabase
            .from('activity_logs')
            .insert([logEntry])
            .select()
        return { data, error }
    },

    // Customers
    getCustomers: async () => {
        const { data, error } = await supabase
            .from('customers')
            .select(`
                *,
                created_by_user:users!customers_created_by_fkey(id, full_name)
            `)
            .order('created_at', { ascending: false })

        // Add last_modified_by field for user attribution
        const dataWithAttribution = data?.map(row => ({
            ...row,
            last_modified_by: row.created_by_user?.full_name || null
        }))

        return { data: dataWithAttribution, error }
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

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'CREATE',
                entity_type: 'Customer',
                entity_id: data[0].id,
                entity_name: data[0].name || data[0].customer_code,
                details: { customer_code: data[0].customer_code, company: data[0].company_name }
            })
        }

        return { data, error }
    },

    updateCustomer: async (id, customerData) => {
        const { data, error } = await supabase
            .from('customers')
            .update(customerData)
            .eq('id', id)
            .select()

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'UPDATE',
                entity_type: 'Customer',
                entity_id: id,
                entity_name: data[0].name || data[0].customer_code,
                details: { updated_fields: Object.keys(customerData) }
            })
        }

        return { data, error }
    },

    deleteCustomer: async (id) => {
        // Get customer name before deleting
        const { data: customer } = await supabase.from('customers').select('name, customer_code').eq('id', id).single()

        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id)

        // Log activity
        if (!error) {
            await db.createActivityLog({
                action_type: 'DELETE',
                entity_type: 'Customer',
                entity_id: id,
                entity_name: customer?.name || customer?.customer_code || 'Unknown',
                details: null
            })
        }

        return { error }
    },

    // Products
    getProducts: async () => {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                created_by_user:users!products_created_by_fkey(id, full_name)
            `)
            .order('created_at', { ascending: false })

        // Add last_modified_by field for user attribution
        const dataWithAttribution = data?.map(row => ({
            ...row,
            last_modified_by: row.created_by_user?.full_name || null
        }))

        return { data: dataWithAttribution, error }
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

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'CREATE',
                entity_type: 'Product',
                entity_id: data[0].id,
                entity_name: data[0].name || data[0].sku,
                details: { sku: data[0].sku, category: data[0].category }
            })
        }

        return { data, error }
    },

    updateProduct: async (id, productData) => {
        const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)
            .select()

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'UPDATE',
                entity_type: 'Product',
                entity_id: id,
                entity_name: data[0].name || data[0].sku,
                details: { updated_fields: Object.keys(productData) }
            })
        }

        return { data, error }
    },

    deleteProduct: async (id) => {
        // Get product name before deleting
        const { data: product } = await supabase.from('products').select('name, sku').eq('id', id).single()

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        // Log activity
        if (!error) {
            await db.createActivityLog({
                action_type: 'DELETE',
                entity_type: 'Product',
                entity_id: id,
                entity_name: product?.name || product?.sku || 'Unknown',
                details: null
            })
        }

        return { error }
    },

    // Inventory
    getInventory: async () => {
        const { data, error } = await supabase
            .from('inventory')
            .select(`
                *,
                product:products(*),
                store:stores(*),
                updated_by_user:users!inventory_updated_by_fkey(id, full_name)
            `)
            .order('updated_at', { ascending: false })

        // Add last_modified_by field for user attribution
        const dataWithAttribution = data?.map(row => ({
            ...row,
            last_modified_by: row.updated_by_user?.full_name || null
        }))

        return { data: dataWithAttribution, error }
    },

    createInventory: async (inventoryData) => {
        const currentUser = await auth.getCurrentUser()
        const dataWithCreator = {
            ...inventoryData,
            updated_by: currentUser?.id
        }

        const { data, error } = await supabase
            .from('inventory')
            .insert([dataWithCreator])
            .select()

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'CREATE',
                entity_type: 'Inventory',
                entity_id: data[0].id,
                entity_name: `Stock Entry`,
                details: { quantity: data[0].quantity, product_id: data[0].product_id }
            })
        }

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

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'UPDATE',
                entity_type: 'Inventory',
                entity_id: id,
                entity_name: `Stock Update`,
                details: { updated_fields: Object.keys(inventoryData), new_quantity: data[0].quantity }
            })
        }

        return { data, error }
    },

    // Orders
    getOrders: async () => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                customer:customers(*),
                order_items(*, product:products(*)),
                created_by_user:users!orders_created_by_fkey(id, full_name)
            `)
            .order('order_date', { ascending: false })

        // Add last_modified_by field for user attribution
        const dataWithAttribution = data?.map(row => ({
            ...row,
            last_modified_by: row.created_by_user?.full_name || null
        }))

        return { data: dataWithAttribution, error }
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

        // Log activity
        await db.createActivityLog({
            action_type: 'CREATE',
            entity_type: 'Order',
            entity_id: order.id,
            entity_name: order.order_number,
            details: { total_amount: order.total_amount, items_count: orderItems.length }
        })

        return { data: order, error: null }
    },

    updateOrder: async (id, orderData) => {
        const { data, error } = await supabase
            .from('orders')
            .update(orderData)
            .eq('id', id)
            .select()

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'UPDATE',
                entity_type: 'Order',
                entity_id: id,
                entity_name: data[0].order_number,
                details: { updated_fields: Object.keys(orderData), status: data[0].status }
            })
        }

        return { data, error }
    },

    // Sales
    getSales: async () => {
        const { data, error } = await supabase
            .from('sales')
            .select(`
                *,
                customer:customers(*),
                order:orders(*),
                created_by_user:users!sales_created_by_fkey(id, full_name)
            `)
            .order('sale_date', { ascending: false })

        // Add last_modified_by field for user attribution
        const dataWithAttribution = data?.map(row => ({
            ...row,
            last_modified_by: row.created_by_user?.full_name || null
        }))

        return { data: dataWithAttribution, error }
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

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'CREATE',
                entity_type: 'Sale',
                entity_id: data[0].id,
                entity_name: data[0].invoice_number,
                details: { total_amount: data[0].total_amount, payment_method: data[0].payment_method }
            })
        }

        return { data, error }
    },

    updateSale: async (id, saleData) => {
        const { data, error } = await supabase
            .from('sales')
            .update(saleData)
            .eq('id', id)
            .select()

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'UPDATE',
                entity_type: 'Sale',
                entity_id: id,
                entity_name: data[0].invoice_number,
                details: { updated_fields: Object.keys(saleData) }
            })
        }

        return { data, error }
    },

    deleteSale: async (id) => {
        // Get sale info before deleting
        const { data: sale } = await supabase.from('sales').select('invoice_number').eq('id', id).single()

        const { error } = await supabase
            .from('sales')
            .delete()
            .eq('id', id)

        // Log activity
        if (!error) {
            await db.createActivityLog({
                action_type: 'DELETE',
                entity_type: 'Sale',
                entity_id: id,
                entity_name: sale?.invoice_number || 'Unknown',
                details: null
            })
        }

        return { error }
    },

    // Packing
    getPacking: async () => {
        const { data, error } = await supabase
            .from('packing')
            .select(`
                *,
                order:orders(*),
                store:stores(*),
                packing_items(*, product:products(*)),
                packed_by_user:users!packing_packed_by_fkey(id, full_name)
            `)
            .order('packed_date', { ascending: false })

        // Add last_modified_by field for user attribution
        const dataWithAttribution = data?.map(row => ({
            ...row,
            last_modified_by: row.packed_by_user?.full_name || null
        }))

        return { data: dataWithAttribution, error }
    },

    // Stores
    getStores: async () => {
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .order('name')
        return { data, error }
    },

    createStore: async (storeData) => {
        const { data, error } = await supabase
            .from('stores')
            .insert([storeData])
            .select()

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'CREATE',
                entity_type: 'Store',
                entity_id: data[0].id,
                entity_name: data[0].name,
                details: { location: data[0].location }
            })
        }

        return { data, error }
    },

    updateStore: async (id, storeData) => {
        const { data, error } = await supabase
            .from('stores')
            .update(storeData)
            .eq('id', id)
            .select()

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'UPDATE',
                entity_type: 'Store',
                entity_id: id,
                entity_name: data[0].name,
                details: { updated_fields: Object.keys(storeData) }
            })
        }

        return { data, error }
    },

    deleteStore: async (id) => {
        // Get store name before deleting
        const { data: store } = await supabase.from('stores').select('name').eq('id', id).single()

        const { error } = await supabase
            .from('stores')
            .delete()
            .eq('id', id)

        // Log activity
        if (!error) {
            await db.createActivityLog({
                action_type: 'DELETE',
                entity_type: 'Store',
                entity_id: id,
                entity_name: store?.name || 'Unknown',
                details: null
            })
        }

        return { error }
    },

    // Packing
    createPacking: async (packingData, packingItems) => {
        const currentUser = await auth.getCurrentUser()
        const dataWithPacker = {
            ...packingData,
            packed_by: currentUser?.id
        }

        // Create packing record
        const { data: packing, error: packingError } = await supabase
            .from('packing')
            .insert([dataWithPacker])
            .select()
            .single()

        if (packingError) return { data: null, error: packingError }

        // Create packing items
        const itemsWithPackingId = packingItems.map(item => ({
            ...item,
            packing_id: packing.id,
        }))

        const { error: itemsError } = await supabase
            .from('packing_items')
            .insert(itemsWithPackingId)

        if (itemsError) {
            // Rollback packing if items failed
            await supabase.from('packing').delete().eq('id', packing.id)
            return { data: null, error: itemsError }
        }

        // Log activity
        await db.createActivityLog({
            action_type: 'CREATE',
            entity_type: 'Packing',
            entity_id: packing.id,
            entity_name: packing.packing_slip_number,
            details: { total_packages: packing.total_packages, items_count: packingItems.length }
        })

        return { data: packing, error: null }
    },

    updatePacking: async (id, packingData) => {
        const { data, error } = await supabase
            .from('packing')
            .update(packingData)
            .eq('id', id)
            .select()

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'UPDATE',
                entity_type: 'Packing',
                entity_id: id,
                entity_name: data[0].packing_slip_number,
                details: { updated_fields: Object.keys(packingData), status: data[0].status }
            })
        }

        return { data, error }
    },

    deletePacking: async (id) => {
        // Get packing info before deleting
        const { data: packing } = await supabase.from('packing').select('packing_slip_number').eq('id', id).single()

        const { error } = await supabase
            .from('packing')
            .delete()
            .eq('id', id)

        // Log activity
        if (!error) {
            await db.createActivityLog({
                action_type: 'DELETE',
                entity_type: 'Packing',
                entity_id: id,
                entity_name: packing?.packing_slip_number || 'Unknown',
                details: null
            })
        }

        return { error }
    },

    // Users Management
    getUsers: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, role, phone, is_active, created_at')
            .order('created_at', { ascending: false })
        return { data, error }
    },

    createUser: async (userData) => {
        // Hash password before storing
        const passwordHash = await auth.hashPassword(userData.password)
        const { password, ...userDataWithoutPassword } = userData

        const dataWithHash = {
            ...userDataWithoutPassword,
            password_hash: passwordHash,
            email: userData.email.toLowerCase()
        }

        const { data, error } = await supabase
            .from('users')
            .insert([dataWithHash])
            .select('id, email, full_name, role, phone, is_active, created_at')

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'CREATE',
                entity_type: 'User',
                entity_id: data[0].id,
                entity_name: data[0].full_name,
                details: { email: data[0].email, role: data[0].role }
            })
        }

        return { data, error }
    },

    updateUser: async (id, userData) => {
        const updateData = { ...userData }

        // Hash password if it's being updated
        if (userData.password) {
            updateData.password_hash = await auth.hashPassword(userData.password)
            delete updateData.password
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select('id, email, full_name, role, phone, is_active, created_at')

        // Log activity
        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'UPDATE',
                entity_type: 'User',
                entity_id: id,
                entity_name: data[0].full_name,
                details: { updated_fields: Object.keys(userData).filter(k => k !== 'password') }
            })
        }

        return { data, error }
    },

    deleteUser: async (id) => {
        // Get user name before deleting
        const { data: user } = await supabase.from('users').select('full_name, email').eq('id', id).single()

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)

        // Log activity
        if (!error) {
            await db.createActivityLog({
                action_type: 'DELETE',
                entity_type: 'User',
                entity_id: id,
                entity_name: user?.full_name || user?.email || 'Unknown',
                details: null
            })
        }

        return { error }
    },

    // Packaged Inventory (Pre-Packaging System)
    getPackagedInventory: async (statusFilter = 'available') => {
        let query = supabase
            .from('packaged_inventory')
            .select(`
                *,
                product:products(*),
                created_by_user:users!packaged_inventory_created_by_fkey(id, full_name)
            `)
            .order('packaging_date', { ascending: false })

        if (statusFilter) {
            query = query.eq('status', statusFilter)
        }

        const { data, error } = await query

        const dataWithAttribution = data?.map(row => ({
            ...row,
            last_modified_by: row.created_by_user?.full_name || null
        }))

        return { data: dataWithAttribution, error }
    },

    getPackagedInventoryByProduct: async (productId) => {
        const { data, error } = await supabase
            .from('packaged_inventory')
            .select(`
                *,
                product:products(*)
            `)
            .eq('product_id', productId)
            .eq('status', 'available')
            .order('packaging_date', { ascending: true })

        return { data, error }
    },

    createPackagedInventory: async (inventoryData) => {
        const currentUser = await auth.getCurrentUser()
        const dataWithCreator = {
            ...inventoryData,
            created_by: currentUser?.id
        }

        const { data, error } = await supabase
            .from('packaged_inventory')
            .insert([dataWithCreator])
            .select()

        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'CREATE',
                entity_type: 'Packaged Inventory',
                entity_id: data[0].id,
                entity_name: `Pre-Packaged Stock`,
                details: { quantity: data[0].quantity, product_id: data[0].product_id }
            })
        }

        return { data, error }
    },

    updatePackagedInventoryStatus: async (id, status, notes = null) => {
        const updateData = { status }
        if (notes) {
            updateData.notes = notes
        }

        const { data, error } = await supabase
            .from('packaged_inventory')
            .update(updateData)
            .eq('id', id)
            .select()

        if (!error && data?.[0]) {
            await db.createActivityLog({
                action_type: 'UPDATE',
                entity_type: 'Packaged Inventory',
                entity_id: id,
                entity_name: `Pre-Packaged Stock Status Update`,
                details: { new_status: status }
            })
        }

        return { data, error }
    },

    deletePackagedInventory: async (id) => {
        const { error } = await supabase
            .from('packaged_inventory')
            .delete()
            .eq('id', id)

        if (!error) {
            await db.createActivityLog({
                action_type: 'DELETE',
                entity_type: 'Packaged Inventory',
                entity_id: id,
                entity_name: `Pre-Packaged Stock`,
                details: null
            })
        }

        return { error }
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
            .eq('status', 'pending')

        // Get confirmed orders
        const { count: confirmedOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'confirmed')

        // Get delivered orders
        const { count: deliveredOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'delivered')

        // Get sales this month
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const { data: salesData } = await supabase
            .from('sales')
            .select('total_amount')
            .gte('sale_date', startOfMonth.toISOString())

        const totalSales = salesData?.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0) || 0

        // Get total packing records
        const { count: packingCount } = await supabase
            .from('packing')
            .select('*', { count: 'exact', head: true })

        // Get packing by status
        const { count: packedCount } = await supabase
            .from('packing')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'packed')

        const { count: shippedCount } = await supabase
            .from('packing')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'shipped')

        return {
            customers: customersCount || 0,
            products: productsCount || 0,
            pendingOrders: pendingOrders || 0,
            confirmedOrders: confirmedOrders || 0,
            deliveredOrders: deliveredOrders || 0,
            salesThisMonth: totalSales,
            totalPacking: packingCount || 0,
            packedItems: packedCount || 0,
            shippedItems: shippedCount || 0,
        }
    },
}

export default supabase
