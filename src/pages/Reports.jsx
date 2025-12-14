import { useState, useEffect } from 'react'
import { db } from '../supabase/client'

function Reports() {
    const [viewMode, setViewMode] = useState('statistical') // 'statistical' or 'graphical'
    const [dateRange, setDateRange] = useState('all') // 'today', 'week', 'month', 'quarter', 'year', 'custom', 'all'
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')
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
    }, [dateRange, customStartDate, customEndDate])

    const loadAllReports = async () => {
        setLoading(true)
        try {
            // Calculate date range
            const { startDate, endDate } = getDateRange()

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

            // Filter data by date range
            const filteredOrders = filterByDate(orders.data || [], 'order_date', startDate, endDate)
            const filteredSales = filterByDate(sales.data || [], 'sale_date', startDate, endDate)
            const filteredPacking = filterByDate(packing.data || [], 'packed_date', startDate, endDate)

            setDetailedData({
                customers: customers.data || [],
                products: products.data || [],
                orders: filteredOrders,
                sales: filteredSales,
                packing: filteredPacking,
                inventory: inventory.data || [],
            })
        } catch (error) {
            console.error('Error loading reports:', error)
        } finally {
            setLoading(false)
        }
    }

    const getDateRange = () => {
        const now = new Date()
        let startDate = null
        let endDate = now

        switch (dateRange) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0))
                break
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7))
                break
            case 'month':
                startDate = new Date(now.setDate(now.getDate() - 30))
                break
            case 'quarter':
                startDate = new Date(now.setDate(now.getDate() - 90))
                break
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1))
                break
            case 'custom':
                startDate = customStartDate ? new Date(customStartDate) : null
                endDate = customEndDate ? new Date(customEndDate) : new Date()
                break
            default: // 'all'
                startDate = null
                endDate = null
        }

        return { startDate, endDate }
    }

    const filterByDate = (data, dateField, startDate, endDate) => {
        if (!startDate && !endDate) return data

        return data.filter(item => {
            const itemDate = new Date(item[dateField] || item.created_at)
            if (startDate && itemDate < startDate) return false
            if (endDate && itemDate > endDate) return false
            return true
        })
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
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

            {/* Date Range Filter */}
            <div style={{
                display: 'flex',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-2xl)',
                flexWrap: 'wrap',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius-lg)'
            }}>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '0.95rem' }}>Date Range:</span>

                {['all', 'today', 'week', 'month', 'quarter', 'year', 'custom'].map((range) => (
                    <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                            background: dateRange === range
                                ? 'rgba(59, 130, 246, 0.3)'
                                : 'rgba(255, 255, 255, 0.1)',
                            border: dateRange === range ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {range === 'all' && 'All Time'}
                        {range === 'today' && 'Today'}
                        {range === 'week' && 'Last 7 Days'}
                        {range === 'month' && 'Last 30 Days'}
                        {range === 'quarter' && 'Last 90 Days'}
                        {range === 'year' && 'Last Year'}
                        {range === 'custom' && 'Custom Range'}
                    </button>
                ))}

                {dateRange === 'custom' && (
                    <>
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '0.9rem'
                            }}
                        />
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>to</span>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '0.9rem'
                            }}
                        />
                    </>
                )}
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
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--spacing-2xl)'
        }}>
            {/* Orders Chart Box */}
            <ChartBox
                title="Orders Analysis"
                barData={[
                    { label: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
                    { label: 'Confirmed', value: stats.confirmedOrders, color: '#3b82f6' },
                    { label: 'Delivered', value: stats.deliveredOrders, color: '#22c55e' },
                ]}
                pieData={[
                    { label: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
                    { label: 'Confirmed', value: stats.confirmedOrders, color: '#3b82f6' },
                    { label: 'Delivered', value: stats.deliveredOrders, color: '#22c55e' },
                ]}
            />

            {/* Packing Chart Box */}
            <ChartBox
                title="Packing Status"
                barData={[
                    { label: 'Total', value: stats.totalPacking, color: '#8b5cf6' },
                    { label: 'Packed', value: stats.packedItems, color: '#06b6d4' },
                    { label: 'Shipped', value: stats.shippedItems, color: '#10b981' },
                ]}
                pieData={[
                    { label: 'Packed', value: stats.packedItems, color: '#06b6d4' },
                    { label: 'Shipped', value: stats.shippedItems, color: '#10b981' },
                    { label: 'Pending', value: stats.totalPacking - stats.packedItems - stats.shippedItems, color: '#f59e0b' },
                ]}
            />

            {/* Sales Chart Box */}
            <ChartBox
                title="Sales Distribution"
                barData={calculateSalesDistribution(detailedData.sales)}
                pieData={calculateSalesDistribution(detailedData.sales)}
            />

            {/* Customers Chart Box */}
            <ChartBox
                title="Customer Overview"
                barData={[
                    { label: 'Total Customers', value: stats.customers, color: '#3b82f6' },
                    { label: 'Active Orders', value: detailedData.orders.length, color: '#10b981' },
                ]}
                pieData={[
                    { label: 'With Orders', value: detailedData.orders.length, color: '#10b981' },
                    { label: 'Without Orders', value: Math.max(0, stats.customers - detailedData.orders.length), color: '#94a3b8' },
                ]}
            />

            {/* Inventory Chart Box */}
            <ChartBox
                title="Inventory Analysis"
                barData={calculateInventoryDistribution(detailedData.inventory)}
                pieData={calculateInventoryDistribution(detailedData.inventory)}
            />
        </div>
    )
}

// Helper function to calculate sales distribution
function calculateSalesDistribution(sales) {
    const ranges = [
        { min: 0, max: 10000, label: '0-10k', color: '#3b82f6' },
        { min: 10000, max: 25000, label: '10k-25k', color: '#10b981' },
        { min: 25000, max: 50000, label: '25k-50k', color: '#f59e0b' },
        { min: 50000, max: 100000, label: '50k-100k', color: '#8b5cf6' },
        { min: 100000, max: Infinity, label: '100k+', color: '#ef4444' },
    ]

    return ranges.map(range => ({
        label: range.label,
        value: sales.filter(sale => {
            const amount = parseFloat(sale.total_amount || 0)
            return amount >= range.min && amount < range.max
        }).length,
        color: range.color
    })).filter(item => item.value > 0)
}

// Helper function to calculate inventory distribution
function calculateInventoryDistribution(inventory) {
    const lowStock = inventory.filter(item => item.quantity <= item.reorder_level).length
    const normalStock = inventory.filter(item => item.quantity > item.reorder_level).length

    return [
        { label: 'Low Stock', value: lowStock, color: '#ef4444' },
        { label: 'Normal Stock', value: normalStock, color: '#10b981' },
    ].filter(item => item.value > 0)
}

// Chart Box Component with Toggle
function ChartBox({ title, barData, pieData }) {
    const [chartType, setChartType] = useState('bar')

    return (
        <div className="glass-card" style={{ padding: 'var(--spacing-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h3 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>
                    {title}
                </h3>

                {/* Chart Type Toggle */}
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', background: 'rgba(255, 255, 255, 0.1)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                    <button
                        onClick={() => setChartType('bar')}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                            background: chartType === 'bar' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        📊 Bar
                    </button>
                    <button
                        onClick={() => setChartType('pie')}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                            background: chartType === 'pie' ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        🥧 Pie
                    </button>
                </div>
            </div>

            {/* Chart Display */}
            {chartType === 'bar' ? (
                <BarChart data={barData} />
            ) : (
                <PieChart data={pieData} />
            )}
        </div>
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

// Chart Card Wrapper Component
function ChartCard({ title, children }) {
    return (
        <div className="glass-card" style={{ padding: 'var(--spacing-2xl)' }}>
            <h3 style={{ color: 'white', marginBottom: 'var(--spacing-xl)', fontSize: '1.5rem' }}>
                {title}
            </h3>
            {children}
        </div>
    )
}

// Pie Chart Component
function PieChart({ data }) {
    const total = data.reduce((sum, item) => sum + item.value, 0)

    if (total === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)', color: 'rgba(255,255,255,0.5)' }}>
                No data available
            </div>
        )
    }

    let currentAngle = 0

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xl)', padding: 'var(--spacing-lg)' }}>
            {/* Pie Chart SVG */}
            <div style={{ position: 'relative', width: '350px', height: '350px' }}>
                <svg width="350" height="350" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Shadow/Border Circle */}
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

                    {/* Pie Slices */}
                    {data.map((item, index) => {
                        const percentage = (item.value / total) * 100
                        const angle = (percentage / 100) * 360
                        const startAngle = currentAngle
                        currentAngle += angle

                        const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                        const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                        const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180)
                        const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180)
                        const largeArc = angle > 180 ? 1 : 0

                        return (
                            <g key={index}>
                                <path
                                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={item.color}
                                    opacity="0.9"
                                    stroke="rgba(0,0,0,0.2)"
                                    strokeWidth="0.5"
                                />
                            </g>
                        )
                    })}

                    {/* Center white circle for donut effect */}
                    <circle cx="50" cy="50" r="20" fill="rgba(30, 30, 40, 0.95)" />
                </svg>

                {/* Center Text */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>
                        {total}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                        Total
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', width: '100%', maxWidth: '350px' }}>
                {data.map((item, index) => {
                    const percentage = ((item.value / total) * 100).toFixed(1)
                    return (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--spacing-sm)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: `4px solid ${item.color}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: item.color,
                                    boxShadow: `0 0 8px ${item.color}50`
                                }}></div>
                                <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: '500' }}>
                                    {item.label}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <span style={{ color: 'white', fontSize: '1rem', fontWeight: '700' }}>
                                    {item.value}
                                </span>
                                <span style={{
                                    color: 'rgba(255,255,255,0.6)',
                                    fontSize: '0.85rem',
                                    minWidth: '45px',
                                    textAlign: 'right'
                                }}>
                                    {percentage}%
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Line Chart Component
function LineChart({ data }) {
    const maxValue = Math.max(...data.flatMap(d => [d.customers, d.products, d.orders, d.packing]))
    const width = 600
    const height = 300
    const padding = 40

    const getX = (index) => padding + (index * (width - 2 * padding)) / (data.length - 1)
    const getY = (value) => height - padding - ((value / maxValue) * (height - 2 * padding))

    const lines = [
        { key: 'customers', color: '#3b82f6', label: 'Customers' },
        { key: 'products', color: '#10b981', label: 'Products' },
        { key: 'orders', color: '#f59e0b', label: 'Orders' },
        { key: 'packing', color: '#8b5cf6', label: 'Packing' },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <svg width="100%" height="300" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((factor, i) => (
                    <line
                        key={i}
                        x1={padding}
                        y1={height - padding - factor * (height - 2 * padding)}
                        x2={width - padding}
                        y2={height - padding - factor * (height - 2 * padding)}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                ))}

                {/* Lines */}
                {lines.map((line) => {
                    const points = data.map((d, i) => `${getX(i)},${getY(d[line.key])}`).join(' ')
                    return (
                        <polyline
                            key={line.key}
                            points={points}
                            fill="none"
                            stroke={line.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )
                })}

                {/* Points */}
                {lines.map((line) =>
                    data.map((d, i) => (
                        <circle
                            key={`${line.key}-${i}`}
                            cx={getX(i)}
                            cy={getY(d[line.key])}
                            r="5"
                            fill={line.color}
                        />
                    ))
                )}

                {/* X-axis labels */}
                {data.map((d, i) => (
                    <text
                        key={i}
                        x={getX(i)}
                        y={height - 10}
                        fill="white"
                        fontSize="12"
                        textAnchor="middle"
                    >
                        {d.label}
                    </text>
                ))}
            </svg>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', justifyContent: 'center', flexWrap: 'wrap' }}>
                {lines.map((line) => (
                    <div key={line.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <div style={{ width: '20px', height: '3px', background: line.color }}></div>
                        <span style={{ color: 'white', fontSize: '0.9rem' }}>{line.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Scatter Plot Component
function ScatterPlot({ data }) {
    const maxX = Math.max(...data.map(d => d.x), 100)
    const maxY = Math.max(...data.map(d => d.y), 100)
    const width = 600
    const height = 400
    const padding = 50

    return (
        <svg width="100%" height="400" viewBox={`0 0 ${width} ${height}`}>
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((factor, i) => (
                <g key={i}>
                    <line
                        x1={padding}
                        y1={height - padding - factor * (height - 2 * padding)}
                        x2={width - padding}
                        y2={height - padding - factor * (height - 2 * padding)}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                    <line
                        x1={padding + factor * (width - 2 * padding)}
                        y1={padding}
                        x2={padding + factor * (width - 2 * padding)}
                        y2={height - padding}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                </g>
            ))}

            {/* Points */}
            {data.map((point, i) => {
                const x = padding + (point.x / maxX) * (width - 2 * padding)
                const y = height - padding - (point.y / maxY) * (height - 2 * padding)
                return (
                    <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="6"
                        fill="#3b82f6"
                        opacity="0.7"
                    >
                        <title>{point.label}</title>
                    </circle>
                )
            })}
        </svg>
    )
}

// Heatmap Component
function Heatmap({ orders }) {
    const weeks = 5
    const daysCount = weeks * 7

    // Calculate activity from real orders
    const activityData = Array(daysCount).fill(0)
    const today = new Date()

    orders.forEach(order => {
        const orderDate = new Date(order.order_date || order.created_at)
        const daysDiff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24))

        if (daysDiff >= 0 && daysDiff < daysCount) {
            activityData[daysCount - 1 - daysDiff]++
        }
    })

    const maxActivity = Math.max(...activityData, 1)

    const getColor = (value) => {
        const intensity = value / maxActivity
        return `rgba(16, 185, 129, ${intensity * 0.9 + 0.1})`
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: '4px' }}>
                {activityData.map((value, index) => (
                    <div
                        key={index}
                        style={{
                            aspectRatio: '1',
                            background: getColor(value),
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        title={`Orders: ${value}`}
                    />
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                <span>Less</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
                        <div
                            key={i}
                            style={{
                                width: '16px',
                                height: '16px',
                                background: `rgba(16, 185, 129, ${intensity * 0.9 + 0.1})`,
                                borderRadius: '2px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        />
                    ))}
                </div>
                <span>More</span>
            </div>
        </div>
    )
}

// Histogram Component
function Histogram({ sales }) {
    // Calculate sales distribution
    const ranges = [
        { min: 0, max: 10000, label: '0-10k', color: '#3b82f6' },
        { min: 10000, max: 25000, label: '10k-25k', color: '#10b981' },
        { min: 25000, max: 50000, label: '25k-50k', color: '#f59e0b' },
        { min: 50000, max: 100000, label: '50k-100k', color: '#8b5cf6' },
        { min: 100000, max: Infinity, label: '100k+', color: '#ef4444' },
    ]

    const data = ranges.map(range => ({
        range: range.label,
        count: sales.filter(sale => {
            const amount = parseFloat(sale.total_amount || 0)
            return amount >= range.min && amount < range.max
        }).length,
        color: range.color
    }))

    const maxCount = Math.max(...data.map(d => d.count), 1)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-md)', height: '300px' }}>
                {data.map((item, index) => (
                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <div style={{ fontSize: '1rem', color: 'white', fontWeight: '700' }}>
                            {item.count}
                        </div>
                        <div
                            style={{
                                width: '100%',
                                height: `${(item.count / maxCount) * 100}%`,
                                background: item.color,
                                borderRadius: 'var(--radius-md)',
                                transition: 'height 0.5s ease',
                                minHeight: '20px'
                            }}
                        />
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                            {item.range}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Reports
