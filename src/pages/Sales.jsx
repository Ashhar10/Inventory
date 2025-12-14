import { useState, useEffect } from 'react'
import { db } from '../supabase/client'
import TableView from '../components/TableView'
import Form from '../components/Form'
import { useModal } from '../components/useModal.jsx'

function Sales() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingSale, setEditingSale] = useState(null)
    const { showSuccess, showError, showConfirm, ModalComponent } = useModal()

    // For dropdowns
    const [customers, setCustomers] = useState([])
    const [orders, setOrders] = useState([])

    const columns = [
        { key: 'invoice_number', label: 'Invoice #' },
        {
            key: 'customer',
            label: 'Customer',
            render: (val) => val?.name || 'N/A'
        },
        {
            key: 'sale_date',
            label: 'Sale Date',
            render: (val) => new Date(val).toLocaleDateString()
        },
        {
            key: 'total_amount',
            label: 'Total Amount',
            render: (val) => `Rs. ${parseFloat(val || 0).toFixed(2)}`
        },
        {
            key: 'paid_amount',
            label: 'Paid Amount',
            render: (val) => `Rs. ${parseFloat(val || 0).toFixed(2)}`
        },
        {
            key: 'balance',
            label: 'Balance',
            render: (val) => {
                const balance = parseFloat(val || 0)
                return (
                    <span style={{ color: balance > 0 ? '#ef4444' : '#10b981', fontWeight: '700' }}>
                        Rs. {balance.toFixed(2)}
                    </span>
                )
            }
        },
        {
            key: 'payment_method',
            label: 'Payment Method',
            render: (val) => val?.replace('_', ' ').toUpperCase() || 'N/A'
        },
        {
            key: 'payment_status',
            label: 'Status',
            render: (val) => {
                const colors = {
                    paid: '#22c55e',
                    partial: '#f59e0b',
                    unpaid: '#ef4444',
                }
                return (
                    <span style={{
                        background: colors[val] || '#6b7280',
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
    ]

    const formFields = [
        { name: 'invoice_number', label: 'Invoice Number', type: 'text', required: true, placeholder: 'AUTO' },
        {
            name: 'customer_id',
            label: 'Customer',
            type: 'select',
            required: true,
            options: customers.map(c => ({ value: c.id, label: `${c.customer_code} - ${c.name}` }))
        },
        {
            name: 'order_id',
            label: 'Related Order (Optional)',
            type: 'select',
            options: [{ value: '', label: 'None' }, ...orders.map(o => ({ value: o.id, label: o.order_number }))]
        },
        { name: 'sale_date', label: 'Sale Date', type: 'date', required: true },
        { name: 'total_amount', label: 'Total Amount (Rs.)', type: 'number', required: true, placeholder: '0.00' },
        { name: 'paid_amount', label: 'Paid Amount (Rs.)', type: 'number', placeholder: '0.00' },
        {
            name: 'payment_method',
            label: 'Payment Method',
            type: 'select',
            options: [
                { value: 'cash', label: 'Cash' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'credit', label: 'Credit' },
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
        { name: 'notes', label: 'Sale Notes', type: 'textarea', placeholder: 'Additional notes about this sale...' },
    ]

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)

        const { data, error } = await db.getSales()
        if (!error && data) {
            setSales(data)
        }

        // Load customers for dropdown
        const { data: customersData } = await db.getCustomers()
        if (customersData) setCustomers(customersData)

        // Load orders for dropdown
        const { data: ordersData } = await db.getOrders()
        if (ordersData) setOrders(ordersData)

        setLoading(false)
    }

    const handleAdd = () => {
        setEditingSale(null)
        setShowModal(true)
    }

    const handleEdit = (sale) => {
        // Prepare editing data
        const editData = {
            ...sale,
            sale_date: sale.sale_date ? new Date(sale.sale_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            order_id: sale.order_id || ''
        }
        setEditingSale(editData)
        setShowModal(true)
    }

    const handleDelete = async (sale) => {
        showConfirm(
            `Are you sure you want to delete sale invoice "${sale.invoice_number}"? This action cannot be undone.`,
            async () => {
                // We don't have a delete method yet, so we'll skip for now
                showError('Delete functionality not yet implemented')
            },
            'Delete Sale'
        )
    }

    const handleSubmit = async (formData) => {
        try {
            const saleData = {
                invoice_number: formData.invoice_number || `INV-${Date.now().toString().slice(-6)}`,
                customer_id: formData.customer_id,
                order_id: formData.order_id || null,
                sale_date: formData.sale_date || new Date().toISOString(),
                total_amount: formData.total_amount ? parseFloat(formData.total_amount) : 0,
                paid_amount: formData.paid_amount ? parseFloat(formData.paid_amount) : 0,
                payment_method: formData.payment_method,
                payment_status: formData.payment_status || 'unpaid',
                notes: formData.notes,
            }

            let error
            if (editingSale) {
                // Update not implemented yet in client
                showError('Edit functionality not yet implemented')
                return
            } else {
                const result = await db.createSale(saleData)
                error = result.error
            }

            if (!error) {
                setShowModal(false)
                loadData()
                showSuccess('Sale created successfully!')
            } else {
                showError('Error saving sale: ' + error.message)
            }
        } catch (err) {
            showError('An unexpected error occurred: ' + err.message)
        }
    }

    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0)
    const totalPaid = sales.reduce((sum, sale) => sum + parseFloat(sale.paid_amount || 0), 0)
    const totalBalance = sales.reduce((sum, sale) => sum + parseFloat(sale.balance || 0), 0)

    return (
        <>
            <ModalComponent />

            <TableView
                title="Sales Management"
                columns={columns}
                data={sales}
                onAdd={handleAdd}
                onEdit={handleEdit}
                loading={loading}
            />

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
                            {editingSale ? 'Edit Sale' : 'Create New Sale'}
                        </h2>
                        <Form
                            fields={formFields}
                            initialData={editingSale || {
                                payment_status: 'unpaid',
                                sale_date: new Date().toISOString().split('T')[0],
                                total_amount: 0,
                                paid_amount: 0,
                                payment_method: 'cash'
                            }}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowModal(false)}
                            submitLabel={editingSale ? 'Update Sale' : 'Create Sale'}
                        />
                    </div>
                </div>
            )}

            <div className="container" style={{ marginTop: 'var(--spacing-2xl)' }}>
                <div className="glass-card" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3 style={{ color: 'white', marginBottom: 'var(--spacing-lg)', fontSize: '1.25rem' }}>
                        💵 Sales Summary
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', color: 'white', fontWeight: '800' }}>
                                {sales.length}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Total Invoices</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', color: '#10b981', fontWeight: '800' }}>
                                Rs. {totalRevenue.toLocaleString()}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Total Revenue</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', color: '#22c55e', fontWeight: '800' }}>
                                Rs. {totalPaid.toLocaleString()}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Total Paid</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', color: '#ef4444', fontWeight: '800' }}>
                                Rs. {totalBalance.toLocaleString()}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Outstanding Balance</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sales
