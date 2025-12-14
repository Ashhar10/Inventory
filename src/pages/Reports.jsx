import { useState, useEffect } from 'react'
import { db } from '../supabase/client'

function Reports() {
    const [viewMode, setViewMode] = useState('statistical') // 'statistical' or 'graphical'
    const [stats, setStats] = useState({
        customers: 0,
        products: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        deliveredOrders: 0,
        salesThisMonth: 0,
        totalPacking: 0,
        packedItems: 0,
        shippedItems: 0,
    })
    const [detailedData, setDetailedData] = useState({
        customers: [],
        products: [],
        orders: [],
        sales: [],
        packing: [],
        inventory: [],
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAllReports()
    }, [])

    const loadAllReports = async () => {
        setLoading(true)
        try {
            // Load dashboard stats
            const statsData = await db.getDashboardStats()
            setStats(statsData)

            // Load detailed data for all modules
            const [customers, products, orders, sales, packing, inventory] = await Promise.all([
                db.getCustomers(),
                db.getProducts(),
                db.getOrders(),
                db.getSales(),
                db.getPacking(),
                db.getInventory(),
            ])

            setDetailedData({
                customers: customers.data || [],
                products: products.data || [],
                orders: orders.data || [],
                sales: sales.data || [],
                packing: packing.data || [],
                inventory: inventory.data || [],
            })
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                <h1 className="page-title">Reports & Analytics</h1>

                {/* View Mode Toggle */}
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${viewMode === 'statistical' ? 'active' : ''}`}
                        onClick={() => setViewMode('statistical')}
                    >
                        📊 Statistical
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'graphical' ? 'active' : ''}`}
                        onClick={() => setViewMode('graphical')}
                    >
                        📈 Graphical
                    </button>
                </div>
            </div>

            {viewMode === 'statistical' ? (
                <StatisticalView stats={stats} detailedData={detailedData} />
            ) : (
                <GraphicalView stats={stats} detailedData={detailedData} />
            )}

            <style jsx>{`
                .view-toggle {
                    display: flex;
                    gap: var(--spacing-sm);
                    background: rgba(255, 255, 255, 0.1);
                    padding: 4px;
                    border-radius: var(--radius-lg);
                }

                .toggle-btn {
                    padding: var(--spacing-md) var(--spacing-xl);
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    border-radius: var(--radius-md);
                    transition: all 0.3s ease;
                }

                .toggle-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .toggle-btn.active {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }
            `}</style>
        </div>
    )
}

// Statistical View Component
function StatisticalView({ stats, detailedData }) {
    return (
        <>
            {/* Overview Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-3xl)'
            }}>
                <StatCard title="Total Customers" value={stats.customers} color="#3b82f6" />
                <StatCard title="Total Products" value={stats.products} color="#10b981" />
                <StatCard title="Pending Orders" value={stats.pendingOrders} color="#f59e0b" />
                <StatCard title="Confirmed Orders" value={stats.confirmedOrders} color="#3b82f6" />
                <StatCard title="Delivered Orders" value={stats.deliveredOrders} color="#22c55e" />
                <StatCard title="Total Packing" value={stats.totalPacking} color="#8b5cf6" />
                <StatCard title="Packed Items" value={stats.packedItems} color="#06b6d4" />
                <StatCard title="Shipped Items" value={stats.shippedItems} color="#10b981" />
                <StatCard title="Sales This Month" value={`Rs. ${stats.salesThisMonth.toLocaleString()}`} color="#22c55e" />
            </div>

            {/* Detailed Reports Sections */}
            <div style={{ display: 'grid', gap: 'var(--spacing-2xl)' }}>
                <ReportSection title="Customer Report" data={detailedData.customers} count={stats.customers} />
                <ReportSection title="Product Report" data={detailedData.products} count={stats.products} />
                <ReportSection title="Order Report" data={detailedData.orders} count={detailedData.orders.length} />
                <ReportSection title="Packing Report" data={detailedData.packing} count={stats.totalPacking} />
                <ReportSection title="Inventory Report" data={detailedData.inventory} count={detailedData.inventory.length} />
                <ReportSection title="Sales Report" data={detailedData.sales} count={detailedData.sales.length} />
            </div>
        </>
    )
}

// Graphical View Component
function GraphicalView({ stats, detailedData }) {
    return (
        <>
            {/* Charts Grid */}
            <div style={{ display: 'grid', gap: 'var(--spacing-2xl)' }}>
                {/* Overview Chart */}
                <div className="glass-card" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3 style={{ color: 'white', marginBottom: 'var(--spacing-xl)', fontSize: '1.5rem' }}>
                        System Overview
                    </h3>
                    <BarChart
                        data={[
                            { label: 'Customers', value: stats.customers, color: '#3b82f6' },
                            { label: 'Products', value: stats.products, color: '#10b981' },
                            { label: 'Orders', value: detailedData.orders.length, color: '#f59e0b' },
                            { label: 'Packing', value: stats.totalPacking, color: '#8b5cf6' },
                        ]}
                    />
                </div>

                {/* Orders Status Chart */}
                <div className="glass-card" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3 style={{ color: 'white', marginBottom: 'var(--spacing-xl)', fontSize: '1.5rem' }}>
                        Orders by Status
                    </h3>
                    <BarChart
                        data={[
                            { label: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
                            { label: 'Confirmed', value: stats.confirmedOrders, color: '#3b82f6' },
                            { label: 'Delivered', value: stats.deliveredOrders, color: '#22c55e' },
                        ]}
                    />
                </div>

                {/* Packing Status Chart */}
                <div className="glass-card" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3 style={{ color: 'white', marginBottom: 'var(--spacing-xl)', fontSize: '1.5rem' }}>
                        Packing Status
                    </h3>
                    <BarChart
                        data={[
                            { label: 'Total', value: stats.totalPacking, color: '#8b5cf6' },
                            { label: 'Packed', value: stats.packedItems, color: '#06b6d4' },
                            { label: 'Shipped', value: stats.shippedItems, color: '#10b981' },
                        ]}
                    />
                </div>

                {/* Sales Chart */}
                <div className="glass-card" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3 style={{ color: 'white', marginBottom: 'var(--spacing-xl)', fontSize: '1.5rem' }}>
                        Sales Performance
                    </h3>
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#22c55e' }}>
                            Rs. {stats.salesThisMonth.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', marginTop: 'var(--spacing-md)' }}>
                            Total Sales This Month
                        </div>
                        <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', marginTop: 'var(--spacing-sm)' }}>
                            Based on {detailedData.sales.length} transactions
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// Stat Card Component
function StatCard({ title, value, color }) {
    return (
        <div className="glass-card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: color, marginBottom: 'var(--spacing-sm)' }}>
                {value}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                {title}
            </div>
        </div>
    )
}

// Report Section Component
function ReportSection({ title, data, count }) {
    return (
        <div className="glass-card" style={{ padding: 'var(--spacing-2xl)' }}>
            <h3 style={{ color: 'white', marginBottom: 'var(--spacing-lg)', fontSize: '1.5rem' }}>
                {title}
            </h3>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', marginBottom: 'var(--spacing-md)' }}>
                Total Records: <strong>{count}</strong>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                {data.length > 0 ? (
                    <div>Last updated: {new Date().toLocaleString()}</div>
                ) : (
                    <div>No data available</div>
                )}
            </div>
        </div>
    )
}

// Simple Bar Chart Component
function BarChart({ data }) {
    const maxValue = Math.max(...data.map(d => d.value), 1)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {data.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{ minWidth: '120px', color: 'white', fontWeight: '600' }}>
                        {item.label}
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '40px', position: 'relative' }}>
                        <div
                            style={{
                                width: `${(item.value / maxValue) * 100}%`,
                                height: '100%',
                                background: item.color,
                                transition: 'width 0.5s ease',
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: 'var(--spacing-md)',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '1.1rem'
                            }}
                        >
                            {item.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Reports
