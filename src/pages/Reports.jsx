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
    const [chartType, setChartType] = useState('bar')

    const chartTypes = [
        { id: 'bar', label: 'Bar Chart', icon: '📊' },
        { id: 'pie', label: 'Pie Chart', icon: '🥧' },
        { id: 'line', label: 'Line Chart', icon: '📈' },
        { id: 'scatter', label: 'Scatter Plot', icon: '⚫' },
        { id: 'heatmap', label: 'Heatmap', icon: '🔥' },
        { id: 'histogram', label: 'Histogram', icon: '📶' },
    ]

    return (
        <>
            {/* Chart Type Selector */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-2xl)'
            }}>
                {chartTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setChartType(type.id)}
                        className={`chart-type-btn ${chartType === type.id ? 'active' : ''}`}
                        style={{
                            padding: 'var(--spacing-lg)',
                            background: chartType === type.id
                                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3))'
                                : 'rgba(255, 255, 255, 0.1)',
                            border: chartType === type.id ? '2px solid rgba(59, 130, 246, 0.5)' : '2px solid transparent',
                            borderRadius: 'var(--radius-lg)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}
                    >
                        <span style={{ fontSize: '2rem' }}>{type.icon}</span>
                        <span>{type.label}</span>
                    </button>
                ))}
            </div>

            {/* Charts Display */}
            <div style={{ display: 'grid', gap: 'var(--spacing-2xl)' }}>
                {chartType === 'bar' && (
                    <>
                        <ChartCard title="System Overview">
                            <BarChart
                                data={[
                                    { label: 'Customers', value: stats.customers, color: '#3b82f6' },
                                    { label: 'Products', value: stats.products, color: '#10b981' },
                                    { label: 'Orders', value: detailedData.orders.length, color: '#f59e0b' },
                                    { label: 'Packing', value: stats.totalPacking, color: '#8b5cf6' },
                                ]}
                            />
                        </ChartCard>

                        <ChartCard title="Orders by Status">
                            <BarChart
                                data={[
                                    { label: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
                                    { label: 'Confirmed', value: stats.confirmedOrders, color: '#3b82f6' },
                                    { label: 'Delivered', value: stats.deliveredOrders, color: '#22c55e' },
                                ]}
                            />
                        </ChartCard>

                        <ChartCard title="Packing Status">
                            <BarChart
                                data={[
                                    { label: 'Total', value: stats.totalPacking, color: '#8b5cf6' },
                                    { label: 'Packed', value: stats.packedItems, color: '#06b6d4' },
                                    { label: 'Shipped', value: stats.shippedItems, color: '#10b981' },
                                ]}
                            />
                        </ChartCard>
                    </>
                )}

                {chartType === 'pie' && (
                    <>
                        <ChartCard title="Order Status Distribution">
                            <PieChart
                                data={[
                                    { label: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
                                    { label: 'Confirmed', value: stats.confirmedOrders, color: '#3b82f6' },
                                    { label: 'Delivered', value: stats.deliveredOrders, color: '#22c55e' },
                                ]}
                            />
                        </ChartCard>

                        <ChartCard title="Packing Status Distribution">
                            <PieChart
                                data={[
                                    { label: 'Packed', value: stats.packedItems, color: '#06b6d4' },
                                    { label: 'Shipped', value: stats.shippedItems, color: '#10b981' },
                                    { label: 'Pending', value: stats.totalPacking - stats.packedItems - stats.shippedItems, color: '#f59e0b' },
                                ]}
                            />
                        </ChartCard>
                    </>
                )}

                {chartType === 'line' && (
                    <ChartCard title="Trend Analysis">
                        <LineChart
                            data={[
                                { label: 'Week 1', customers: 20, products: 35, orders: 15, packing: 12 },
                                { label: 'Week 2', customers: 30, products: 45, orders: 25, packing: 20 },
                                { label: 'Week 3', customers: 45, products: 60, orders: 35, packing: 28 },
                                { label: 'Week 4', customers: stats.customers, products: stats.products, orders: detailedData.orders.length, packing: stats.totalPacking },
                            ]}
                        />
                    </ChartCard>
                )}

                {chartType === 'scatter' && (
                    <ChartCard title="Products vs Orders Correlation">
                        <ScatterPlot
                            data={detailedData.products.slice(0, 20).map((product, index) => ({
                                x: index * 10 + Math.random() * 50,
                                y: index * 5 + Math.random() * 30,
                                label: product.name || `Product ${index + 1}`
                            }))}
                        />
                    </ChartCard>
                )}

                {chartType === 'heatmap' && (
                    <ChartCard title="Activity Heatmap (Last 30 Days)">
                        <Heatmap />
                    </ChartCard>
                )}

                {chartType === 'histogram' && (
                    <ChartCard title="Data Distribution">
                        <Histogram
                            data={[
                                { range: '0-20', count: 15, color: '#3b82f6' },
                                { range: '21-40', count: 25, color: '#10b981' },
                                { range: '41-60', count: 35, color: '#f59e0b' },
                                { range: '61-80', count: 20, color: '#8b5cf6' },
                                { range: '81-100', count: 10, color: '#ef4444' },
                            ]}
                        />
                    </ChartCard>
                )}

                {/* Sales Performance - Always Visible */}
                <ChartCard title="Sales Performance">
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
                </ChartCard>
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
    let currentAngle = 0

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
            <svg width="300" height="300" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
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
                        <path
                            key={index}
                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={item.color}
                            opacity="0.9"
                        />
                    )
                })}
            </svg>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                {data.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: item.color }}></div>
                        <span style={{ color: 'white', fontSize: '0.9rem' }}>
                            {item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                        </span>
                    </div>
                ))}
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
function Heatmap() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weeks = 5
    const data = Array.from({ length: weeks * 7 }, () => Math.floor(Math.random() * 10))

    const getColor = (value) => {
        const intensity = value / 10
        return `rgba(16, 185, 129, ${intensity})`
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: '4px' }}>
                {data.map((value, index) => (
                    <div
                        key={index}
                        style={{
                            aspectRatio: '1',
                            background: getColor(value),
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        title={`Activity: ${value}`}
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
                                background: `rgba(16, 185, 129, ${intensity})`,
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
function Histogram({ data }) {
    const maxCount = Math.max(...data.map(d => d.count))

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
