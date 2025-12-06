import { useState, useEffect } from 'react'
import { db, auth } from '../supabase/client'
import TableView from '../components/TableView'

function Orders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

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
                        {val === 'paid' && '✅'}
                        {val === 'partial' && '⚠️'}
                        {val === 'unpaid' && '❌'}
                        {' '}{val?.toUpperCase()}
                    </span>
                )
            }
        },
    ]

    useEffect(() => {
        loadOrders()
    }, [])

    const loadOrders = async () => {
        setLoading(true)
        const { data, error } = await db.getOrders()
        if (!error && data) {
            setOrders(data)
        }
        setLoading(false)
    }

    const handleEdit = (order) => {
        alert('Order editing functionality - coming soon!\nOrder: ' + order.order_number)
    }

    return (
        <>
            <TableView
                title="📋 Orders Management"
                columns={columns}
                data={orders}
                onEdit={handleEdit}
                loading={loading}
            />

            <div className="container" style={{ marginTop: 'var(--spacing-2xl)' }}>
                <div className="glass-card" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3 style={{ color: 'white', marginBottom: 'var(--spacing-lg)', fontSize: '1.25rem' }}>
                        📊 Orders Overview
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
