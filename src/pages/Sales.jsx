import { useState, useEffect } from 'react'
import { db } from '../supabase/client'
import TableView from '../components/TableView'

function Sales() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)

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

    useEffect(() => {
        loadSales()
    }, [])

    const loadSales = async () => {
        setLoading(true)
        const { data, error } = await db.getSales()
        if (!error && data) {
            setSales(data)
        }
        setLoading(false)
    }

    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0)
    const totalPaid = sales.reduce((sum, sale) => sum + parseFloat(sale.paid_amount || 0), 0)
    const totalBalance = sales.reduce((sum, sale) => sum + parseFloat(sale.balance || 0), 0)

    return (
        <>
            <TableView
                title="Sales Management"
                columns={columns}
                data={sales}
                loading={loading}
            />

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
