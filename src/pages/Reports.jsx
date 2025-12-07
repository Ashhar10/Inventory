import { useState, useEffect } from 'react'
import { db } from '../supabase/client'

function Reports() {
    const [stats, setStats] = useState({
        customers: 0,
        products: 0,
        pendingOrders: 0,
        salesThisMonth: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadReports()
    }, [])

    const loadReports = async () => {
        try {
            const data = await db.getDashboardStats()
            setStats(data)
        } catch (error) {
            console.error('Error loading reports:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="container">
            <h1 className="page-title">Reports & Analytics</h1>

            {/* Key Metrics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 'var(--spacing-xl)',
                marginBottom: 'var(--spacing-2xl)'
            }}>
                <div className="glass-card fade-in-up" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>

                    <div style={{ fontSize: '3rem', fontWeight: '800', color: 'white', marginBottom: 'var(--spacing-sm)' }}>
                        {stats.customers}
                    </div>
                    <div style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
                        Total Customers
                    </div>
                </div>

                <div className="glass-card fade-in-up stagger-1" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>

                    <div style={{ fontSize: '3rem', fontWeight: '800', color: 'white', marginBottom: 'var(--spacing-sm)' }}>
                        {stats.products}
                    </div>
                    <div style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
                        Total Products
                    </div>
                </div>

                <div className="glass-card fade-in-up stagger-2" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>

                    <div style={{ fontSize: '3rem', fontWeight: '800', color: 'white', marginBottom: 'var(--spacing-sm)' }}>
                        {stats.pendingOrders}
                    </div>
                    <div style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
                        Pending Orders
                    </div>
                </div>

                <div className="glass-card fade-in-up stagger-3" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>

                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: 'var(--spacing-sm)' }}>
                        Rs. {stats.salesThisMonth.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
                        Sales This Month
                    </div>
                </div>
            </div>

            {/* Report Categories */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--spacing-2xl)'
            }}>
                <div className="glass-card fade-in-up stagger-4" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: 'var(--spacing-lg)' }}>
                        Sales Reports
                    </h3>
                    <ul style={{ listStyle: 'none', color: 'rgba(255,255,255,0.9)' }}>
                        <li style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            Daily Sales Summary
                        </li>
                        <li style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            ✓ Monthly Revenue Report
                        </li>
                        <li style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            ✓ Sales by Product Category
                        </li>
                        <li style={{ padding: 'var(--spacing-md) 0' }}>
                            ✓ Top Customers by Revenue
                        </li>
                    </ul>
                </div>

                <div className="glass-card fade-in-up stagger-5" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: 'var(--spacing-lg)' }}>
                        Inventory Reports
                    </h3>
                    <ul style={{ listStyle: 'none', color: 'rgba(255,255,255,0.9)' }}>
                        <li style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            ✓ Current Stock Levels
                        </li>
                        <li style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            ✓ Low Stock Alert Report
                        </li>
                        <li style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            ✓ Inventory Movement History
                        </li>
                        <li style={{ padding: 'var(--spacing-md) 0' }}>
                            ✓ Stock Valuation Report
                        </li>
                    </ul>
                </div>

                <div className="glass-card fade-in-up stagger-6" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: 'var(--spacing-lg)' }}>
                        Order Reports
                    </h3>
                    <ul style={{ listStyle: 'none', color: 'rgba(255,255,255,0.9)' }}>
                        <li style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            ✓ Order Status Summary
                        </li>
                        <li style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            ✓ Pending Deliveries
                        </li>
                        <li style={{ padding: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            ✓ Order Fulfillment Rate
                        </li>
                        <li style={{ padding: 'var(--spacing-md) 0' }}>
                            ✓ Customer Order History
                        </li>
                    </ul>
                </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="glass-card fade-in-up" style={{
                padding: 'var(--spacing-2xl)',
                marginTop: 'var(--spacing-2xl)',
                textAlign: 'center'
            }}>
                <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: 'var(--spacing-md)' }}>
                    Advanced Analytics Coming Soon!
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>
                    Interactive charts, graphs, and detailed analytics will be available in the next update.
                </p>
            </div>
        </div>
    )
}

export default Reports
