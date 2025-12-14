import { useState, useEffect } from 'react'
import { db, auth } from '../supabase/client'
import TableView from '../components/TableView'
import Form from '../components/Form'
import { useModal } from '../components/useModal.jsx'

function Orders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingOrder, setEditingOrder] = useState(null)
    const { showSuccess, showError, showConfirm, ModalComponent } = useModal()

    // For dropdowns
    const [customers, setCustomers] = useState([])
    const [products, setProducts] = useState([])

    const columns = [
        { key: 'order_number', label: 'Order #' },
        {
            key: 'customer',
            label: 'Customer',
            render: (val) => val?.name || 'N/A'
        },
        {
            key: 'order_date',
            label: 'Order Date',
            render: (val) => new Date(val).toLocaleDateString()
        },
        {
            key: 'delivery_date',
            label: 'Delivery Date',
            render: (val) => val ? new Date(val).toLocaleDateString() : 'Not set'
        },
        {
            key: 'grand_total',
            label: 'Total Amount',
            render: (val) => `Rs. ${parseFloat(val || 0).toFixed(2)}`
        },
        {
            key: 'status',
            label: 'Order Status',
            render: (val) => {
                const statusColors = {
                    pending: '#f59e0b',
                    confirmed: '#3b82f6',
                    processing: '#8b5cf6',
                    packed: '#06b6d4',
                    shipped: '#10b981',
                    delivered: '#22c55e',
                    cancelled: '#ef4444',
                }
                return (
                    <span style={{
                        background: statusColors[val] || '#6b7280',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                    }}>
                        {val}
                    </span>
                )
            }
        },
        {
            key: 'payment_status',
            label: 'Payment',
            render: (val) => {
                const colors = {
                    paid: '#22c55e',
                    partial: '#f59e0b',
                    unpaid: '#ef4444',
                }
                return (
                    <span style={{ color: colors[val] || '#6b7280', fontWeight: '700' }}>
                        {val?.toUpperCase()}
                    </span>
                )
            }
        },
    ]

    const formFields = [
        { name: 'order_number', label: 'Order Number', type: 'text', required: true, placeholder: 'AUTO' },
        {
            name: 'customer_id',
            label: 'Customer',
            type: 'select',
            required: true,
            options: customers.map(c => ({ value: c.id, label: `${c.customer_code} - ${c.name}` }))
        },
        { name: 'order_date', label: 'Order Date', type: 'date', required: true },
        { name: 'delivery_date', label: 'Delivery Date', type: 'date' },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'processing', label: 'Processing' },
                { value: 'packed', label: 'Packed' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
            ]
        },
        {
            name: 'payment_status',
            label: 'Payment Status',
            type: 'select',
            options: [
                { value: 'unpaid', label: 'Unpaid' },
                { value: 'partial', label: 'Partial' },
                { value: 'paid', label: 'Paid' },
            ]
        },
        { name: 'total_amount', label: 'Total Amount (Rs.)', type: 'number', required: true, placeholder: '0.00' },
        { name: 'tax_amount', label: 'Tax Amount (Rs.)', type: 'number', placeholder: '0.00' },
        { name: 'discount_amount', label: 'Discount Amount (Rs.)', type: 'number', placeholder: '0.00' },
        { name: 'notes', label: 'Order Notes', type: 'textarea', placeholder: 'Additional notes about this order...' },
    ]

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)

        const { data, error } = await db.getOrders()
        if (!error && data) {
            setOrders(data)
        }

        // Load customers for dropdown
        const { data: customersData } = await db.getCustomers()
        if (customersData) setCustomers(customersData)

        // Load products for order items
        const { data: productsData } = await db.getProducts()
        if (productsData) setProducts(productsData)

        setLoading(false)
    }

    const handleAdd = () => {
        setEditingOrder(null)
        setShowModal(true)
    }

    const handleEdit = (order) => {
        // Prepare editing data
        const editData = {
            ...order,
            order_date: order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            delivery_date: order.delivery_date ? new Date(order.delivery_date).toISOString().split('T')[0] : ''
        }
        setEditingOrder(editData)
        setShowModal(true)
    }

    const handleDelete = async (order) => {
        showConfirm(
            `Are you sure you want to delete order "${order.order_number}"? This action cannot be undone.`,
            async () => {
                const { error } = await db.updateOrder(order.id, { status: 'cancelled' })
                if (!error) {
                    loadData()
                    showSuccess('Order cancelled successfully!')
                } else {
                    showError('Error cancelling order: ' + error.message)
                }
            },
            'Cancel Order'
        )
    }

    const handleSubmit = async (formData) => {
        try {
            const orderData = {
                order_number: formData.order_number || `ORD-${Date.now().toString().slice(-6)}`,
                customer_id: formData.customer_id,
                order_date: formData.order_date || new Date().toISOString(),
                delivery_date: formData.delivery_date || null,
                status: formData.status || 'pending',
                payment_status: formData.payment_status || 'unpaid',
                total_amount: formData.total_amount ? parseFloat(formData.total_amount) : 0,
                tax_amount: formData.tax_amount ? parseFloat(formData.tax_amount) : 0,
                discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : 0,
                notes: formData.notes,
            }

            let error
            if (editingOrder) {
                const result = await db.updateOrder(editingOrder.id, orderData)
                error = result.error
            } else {
                // For new order, create with empty order items for now
                const result = await db.createOrder(orderData, [])
                error = result.error
            }

            if (!error) {
                setShowModal(false)
                loadData()
                showSuccess(
                    editingOrder ? 'Order updated successfully!' : 'Order created successfully!'
                )
            } else {
                showError('Error saving order: ' + error.message)
            }
        } catch (err) {
            showError('An unexpected error occurred: ' + err.message)
        }
    }

    return (
        <>
            <ModalComponent />

            <TableView
                title="Orders Management"
                columns={columns}
                data={orders}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
            />

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
                            {editingOrder ? 'Edit Order' : 'Create New Order'}
                        </h2>
                        <Form
                            fields={formFields}
                            initialData={editingOrder || {
                                status: 'pending',
                                payment_status: 'unpaid',
                                order_date: new Date().toISOString().split('T')[0],
                                total_amount: 0,
                                tax_amount: 0,
                                discount_amount: 0
                            }}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowModal(false)}
                            submitLabel={editingOrder ? 'Update Order' : 'Create Order'}
                        />
                    </div>
                </div>
            )}

            <div className="container" style={{ marginTop: 'var(--spacing-2xl)' }}>
                <div className="glass-card" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3 style={{ color: 'white', marginBottom: 'var(--spacing-lg)', fontSize: '1.25rem' }}>
                        Orders Overview
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-lg)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', color: 'white', fontWeight: '800' }}>
                                {orders.length}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Total Orders</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', color: '#f59e0b', fontWeight: '800' }}>
                                {orders.filter(o => o.status === 'pending').length}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Pending</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', color: '#3b82f6', fontWeight: '800' }}>
                                {orders.filter(o => o.status === 'confirmed').length}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Confirmed</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', color: '#10b981', fontWeight: '800' }}>
                                {orders.filter(o => o.status === 'delivered').length}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Delivered</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Orders
