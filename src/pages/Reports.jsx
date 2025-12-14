import { useState, useEffect } from 'react'
import { db } from '../supabase/client'
import AnimatedStatBox from '../components/AnimatedStatBox'

function Reports() {
    const [viewMode, setViewMode] = useState('statistical') // 'statistical' or 'graphical'
    const [dateRange, setDateRange] = useState('all') // 'today', 'week', 'month', 'quarter', 'year', 'custom', 'all'
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
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

    // Mobile detection
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <h1 className="page-title" style={{ fontSize: isMobile ? '1.3rem' : undefined }}>Reports</h1>

                {/* View Mode Toggle - Icon only on mobile */}
                <div className="view-toggle" style={{ gap: isMobile ? '4px' : undefined }}>
                    <button
                        className={`toggle-btn ${viewMode === 'statistical' ? 'active' : ''}`}
                        onClick={() => setViewMode('statistical')}
                        style={isMobile ? { padding: '8px', minWidth: '40px' } : {}}
                    >
                        <img src="/assets/icons/Statistical.png" alt="Statistical" style={{ width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px', marginRight: isMobile ? 0 : '8px' }} />
                        {!isMobile && ' Statistical'}
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'graphical' ? 'active' : ''}`}
                        onClick={() => setViewMode('graphical')}
                        style={isMobile ? { padding: '8px', minWidth: '40px' } : {}}
                    >
                        <img src="/assets/icons/Graphical.png" alt="Graphical" style={{ width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px', marginRight: isMobile ? 0 : '8px' }} />
                        {!isMobile && ' Graphical'}
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                        onClick={() => setViewMode('calendar')}
                        style={isMobile ? { padding: '8px', minWidth: '40px' } : {}}
                    >
                        <img src="/assets/icons/Calendar.png" alt="Calendar" style={{ width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px', marginRight: isMobile ? 0 : '8px' }} />
                        {!isMobile && ' Calendar'}
                    </button>
                </div>
            </div>

            {/* Date Range Filter - Compact on mobile, hidden in Calendar View */}
            {viewMode !== 'calendar' && (
                <div style={{
                    display: 'flex',
                    gap: isMobile ? '4px' : 'var(--spacing-md)',
                    marginBottom: isMobile ? 'var(--spacing-lg)' : 'var(--spacing-2xl)',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: isMobile ? 'var(--spacing-sm)' : 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)'
                }}>
                    {!isMobile && <span style={{ color: 'white', fontWeight: '600', fontSize: '0.95rem' }}>Date Range:</span>}

                    {['all', 'today', 'week', 'month', 'quarter', 'year', 'custom'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            style={{
                                padding: isMobile ? '4px 8px' : 'var(--spacing-sm) var(--spacing-lg)',
                                background: dateRange === range
                                    ? 'rgba(59, 130, 246, 0.3)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                border: dateRange === range ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
                                borderRadius: 'var(--radius-sm)',
                                color: 'white',
                                fontSize: isMobile ? '0.65rem' : '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {/* Short labels on mobile */}
                            {range === 'all' && (isMobile ? 'All' : 'All Time')}
                            {range === 'today' && (isMobile ? 'Today' : 'Today')}
                            {range === 'week' && (isMobile ? '7D' : 'Last 7 Days')}
                            {range === 'month' && (isMobile ? '30D' : 'Last 30 Days')}
                            {range === 'quarter' && (isMobile ? '90D' : 'Last 90 Days')}
                            {range === 'year' && (isMobile ? '1Y' : 'Last Year')}
                            {range === 'custom' && (isMobile ? '...' : 'Custom Range')}
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

                    {/* Reset Filters Button */}
                    <button
                        onClick={() => {
                            setDateRange('all')
                            setCustomStartDate('')
                            setCustomEndDate('')
                        }}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            marginLeft: 'auto'
                        }}
                    >
                        <img src="/assets/icons/Reset.png" alt="Reset" style={{ width: '16px', height: '16px', marginRight: '6px' }} /> Reset Filters
                    </button>
                </div>
            )
            }

            {
                viewMode === 'statistical' ? (
                    <StatisticalView stats={stats} detailedData={detailedData} isMobile={isMobile} />
                ) : viewMode === 'graphical' ? (
                    <GraphicalView stats={stats} detailedData={detailedData} isMobile={isMobile} />
                ) : (
                    <CalendarView stats={stats} detailedData={detailedData} isMobile={isMobile} />
                )
            }

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

                /* Calendar day cell hover - show popup */
                .calendar-day-cell:hover .calendar-hover-popup {
                    display: block !important;
                }

                .calendar-day-cell:hover {
                    transform: scale(1.05);
                    z-index: 50;
                }
            `}</style>
        </div >
    )
}

// Statistical View Component - Responsive
function StatisticalView({ stats, detailedData, isMobile }) {
    return (
        <>
            {/* Overview Stats Grid - Single column on mobile */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)',
                gap: isMobile ? 'var(--spacing-md)' : 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-2xl)'
            }}>
                {/* Total Customers */}
                <div className="glass-card stat-card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: '800', color: '#3b82f6', marginBottom: 'var(--spacing-sm)' }}>
                        {stats.customers}
                    </div>
                    <div className="stat-label" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                        Total Customers
                    </div>
                </div>

                {/* Total Products */}
                <div className="glass-card stat-card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981', marginBottom: 'var(--spacing-sm)' }}>
                        {stats.products}
                    </div>
                    <div className="stat-label" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                        Total Products
                    </div>
                </div>

                {/* Orders Slideshow */}
                <AnimatedStatBox
                    slides={[
                        { value: stats.pendingOrders, label: 'Pending Orders' },
                        { value: stats.confirmedOrders || 0, label: 'Confirmed Orders' },
                        { value: stats.deliveredOrders || 0, label: 'Delivered Orders' },
                    ]}
                />

                {/* Sales This Month */}
                <div className="glass-card stat-card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <div className="stat-value" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#22c55e', marginBottom: 'var(--spacing-sm)' }}>
                        Rs. {stats.salesThisMonth.toLocaleString()}
                    </div>
                    <div className="stat-label" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                        Sales This Month
                    </div>
                </div>

                {/* Packing Slideshow */}
                <AnimatedStatBox
                    slides={[
                        { value: stats.totalPacking || 0, label: 'Total Packing' },
                        { value: stats.packedItems || 0, label: 'Packed Items' },
                        { value: stats.shippedItems || 0, label: 'Shipped Items' },
                    ]}
                />
            </div>

            {/* Professional Reports Section - Responsive */}
            <div className="glass-card" style={{ padding: isMobile ? 'var(--spacing-lg)' : 'var(--spacing-2xl)' }}>
                <h2 style={{ color: 'white', fontSize: isMobile ? '1.1rem' : '1.5rem', marginBottom: 'var(--spacing-lg)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'var(--spacing-md)' }}>
                    <img src="/assets/icons/Reports.png" alt="Reports" style={{ width: isMobile ? '18px' : '24px', height: isMobile ? '18px' : '24px', marginRight: '10px', verticalAlign: 'middle' }} />
                    Detailed Reports
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 'var(--spacing-md)' : 'var(--spacing-lg)' }}>
                    {/* Customer Report */}
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-xl)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                            <img src="/assets/icons/Customers.png" alt="Customers" style={{ width: '32px', height: '32px', marginRight: '12px' }} />
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>Customer Report</h3>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#3b82f6', marginBottom: 'var(--spacing-sm)' }}>
                            {stats.customers}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            Total registered customers
                        </div>
                        <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                            Last updated: {new Date().toLocaleDateString()}
                        </div>
                    </div>

                    {/* Product Report */}
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-xl)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                            <img src="/assets/icons/Products.png" alt="Products" style={{ width: '32px', height: '32px', marginRight: '12px' }} />
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>Product Report</h3>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981', marginBottom: 'var(--spacing-sm)' }}>
                            {stats.products}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            Total products in catalog
                        </div>
                        <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                            Last updated: {new Date().toLocaleDateString()}
                        </div>
                    </div>

                    {/* Order Report */}
                    <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-xl)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                            <img src="/assets/icons/Orders.png" alt="Orders" style={{ width: '32px', height: '32px', marginRight: '12px' }} />
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>Order Report</h3>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b', marginBottom: 'var(--spacing-sm)' }}>
                            {detailedData.orders.length}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            Total orders processed
                        </div>
                        <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                            Pending: {stats.pendingOrders} | Confirmed: {stats.confirmedOrders} | Delivered: {stats.deliveredOrders}
                        </div>
                    </div>

                    {/* Packing Report */}
                    <div style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-xl)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                            <img src="/assets/icons/Packing.png" alt="Packing" style={{ width: '32px', height: '32px', marginRight: '12px' }} />
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>Packing Report</h3>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#8b5cf6', marginBottom: 'var(--spacing-sm)' }}>
                            {stats.totalPacking}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            Total packing operations
                        </div>
                        <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                            Packed: {stats.packedItems} | Shipped: {stats.shippedItems}
                        </div>
                    </div>

                    {/* Inventory Report */}
                    <div style={{
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-xl)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                            <img src="/assets/icons/Inventory.png" alt="Inventory" style={{ width: '32px', height: '32px', marginRight: '12px' }} />
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>Inventory Report</h3>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#06b6d4', marginBottom: 'var(--spacing-sm)' }}>
                            {detailedData.inventory.length}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            Inventory items tracked
                        </div>
                        <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                            Last updated: {new Date().toLocaleDateString()}
                        </div>
                    </div>

                    {/* Sales Report */}
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-xl)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                            <img src="/assets/icons/Sales.png" alt="Sales" style={{ width: '32px', height: '32px', marginRight: '12px' }} />
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem' }}>Sales Report</h3>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#22c55e', marginBottom: 'var(--spacing-sm)' }}>
                            Rs. {stats.salesThisMonth.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            Total sales: {detailedData.sales.length} transactions
                        </div>
                        <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                            This month's revenue
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

// Calendar View Component - Click Modal (No Hover) - Responsive
function CalendarView({ stats, detailedData, isMobile }) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(null)

    // Handle date click
    const handleDateClick = (date) => {
        setSelectedDate(date)
    }

    // Close modal when clicking backdrop
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setSelectedDate(null)
        }
    }

    // Get calendar days for the current month
    const getCalendarDays = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []
        // Add empty cells for days before the month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }
        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }
        return days
    }

    // Get data for a specific date
    const getDateData = (date) => {
        if (!date) return null

        const dateStr = date.toISOString().split('T')[0]

        const orders = detailedData.orders.filter(o => {
            const orderDate = new Date(o.order_date || o.created_at).toISOString().split('T')[0]
            return orderDate === dateStr
        })

        const sales = detailedData.sales.filter(s => {
            const saleDate = new Date(s.sale_date || s.created_at).toISOString().split('T')[0]
            return saleDate === dateStr
        })

        const packing = detailedData.packing.filter(p => {
            const packDate = new Date(p.packed_date || p.created_at).toISOString().split('T')[0]
            return packDate === dateStr
        })

        return {
            date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            orders: orders.length,
            sales: sales.length,
            salesAmount: sales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0),
            packing: packing.length,
            hasActivity: orders.length > 0 || sales.length > 0 || packing.length > 0
        }
    }

    const days = getCalendarDays()
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    return (
        <div style={{ position: 'relative' }}>
            {/* Calendar Header - Compact on mobile */}
            <div className="glass-card" style={{ padding: isMobile ? 'var(--spacing-md)' : 'var(--spacing-2xl)', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                    <button
                        onClick={goToPreviousMonth}
                        style={{
                            padding: isMobile ? '6px' : 'var(--spacing-md) var(--spacing-lg)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <img src="/assets/icons/Previous.png" alt="Previous" style={{ width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px' }} />
                    </button>

                    {/* Month/Year Selector */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                        <select
                            value={currentMonth.getMonth()}
                            onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))}
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                <option key={index} value={index} style={{ background: '#1a1a2e', color: 'white' }}>{month}</option>
                            ))}
                        </select>

                        <select
                            value={currentMonth.getFullYear()}
                            onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))}
                            style={{
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                                <option key={year} value={year} style={{ background: '#1a1a2e', color: 'white' }}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={goToNextMonth}
                        style={{
                            padding: isMobile ? '6px' : 'var(--spacing-md) var(--spacing-lg)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <img src="/assets/icons/Next.png" alt="Next" style={{ width: isMobile ? '14px' : '20px', height: isMobile ? '14px' : '20px' }} />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div style={{ marginTop: 'var(--spacing-2xl)' }}>
                    {/* Days of week header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontWeight: '600', padding: 'var(--spacing-sm)' }}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days - Responsive */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                        {days.map((date, index) => {
                            if (!date) {
                                return <div key={`empty-${index}`} style={{ aspectRatio: '1', minHeight: '45px' }}></div>
                            }

                            const dateData = getDateData(date)
                            const isToday = date.toDateString() === new Date().toDateString()
                            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleDateClick(date)}
                                    style={{
                                        aspectRatio: '1',
                                        minHeight: '45px',
                                        background: isSelected
                                            ? 'rgba(59, 130, 246, 0.4)'
                                            : isToday
                                                ? 'rgba(16, 185, 129, 0.3)'
                                                : dateData.hasActivity
                                                    ? 'rgba(59, 130, 246, 0.15)'
                                                    : 'rgba(255, 255, 255, 0.05)',
                                        border: isToday ? '2px solid rgba(16, 185, 129, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '2px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative'
                                    }}
                                    className="calendar-day-cell"
                                >
                                    {/* Date Number */}
                                    <div style={{ color: 'white', fontWeight: '700', fontSize: isMobile ? '0.85rem' : '1rem' }}>
                                        {date.getDate()}
                                    </div>

                                    {/* Activity indicator dot */}
                                    {dateData.hasActivity && (
                                        <div style={{
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            background: '#3b82f6',
                                            marginTop: '2px'
                                        }}></div>
                                    )}

                                    {/* Hover Popup - Triangle + Box with Icons */}
                                    {dateData.hasActivity && (
                                        <div className="calendar-hover-popup" style={{
                                            display: 'none',
                                            position: 'absolute',
                                            top: '100%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            paddingTop: '8px',
                                            zIndex: 100
                                        }}>
                                            {/* Triangle pointer */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '0',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: 0,
                                                height: 0,
                                                borderLeft: '8px solid transparent',
                                                borderRight: '8px solid transparent',
                                                borderBottom: '8px solid rgba(30, 30, 45, 0.95)'
                                            }}></div>

                                            {/* Popup box */}
                                            <div style={{
                                                background: 'rgba(30, 30, 45, 0.95)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '8px 10px',
                                                minWidth: '60px',
                                                backdropFilter: 'blur(8px)'
                                            }}>
                                                {/* Date centered */}
                                                <div style={{
                                                    textAlign: 'center',
                                                    color: 'white',
                                                    fontWeight: '700',
                                                    fontSize: '0.75rem',
                                                    marginBottom: '6px',
                                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                    paddingBottom: '4px'
                                                }}>
                                                    {date.getDate()}
                                                </div>

                                                {/* Icons row - horizontal */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}>
                                                    {dateData.orders > 0 && (
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{
                                                                width: dateData.orders > 9 ? '22px' : '18px',
                                                                height: dateData.orders > 9 ? '22px' : '18px',
                                                                borderRadius: '50%',
                                                                background: 'rgba(245, 158, 11, 0.3)',
                                                                border: '1px solid rgba(245, 158, 11, 0.6)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                margin: '0 auto 2px'
                                                            }}>
                                                                <img src="/assets/icons/Package.png" alt="O" style={{ width: '10px', height: '10px' }} />
                                                            </div>
                                                            <div style={{ color: '#f59e0b', fontSize: dateData.orders > 9 ? '0.65rem' : '0.55rem', fontWeight: '700' }}>{dateData.orders}</div>
                                                        </div>
                                                    )}
                                                    {dateData.sales > 0 && (
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{
                                                                width: dateData.sales > 9 ? '22px' : '18px',
                                                                height: dateData.sales > 9 ? '22px' : '18px',
                                                                borderRadius: '50%',
                                                                background: 'rgba(16, 185, 129, 0.3)',
                                                                border: '1px solid rgba(16, 185, 129, 0.6)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                margin: '0 auto 2px'
                                                            }}>
                                                                <img src="/assets/icons/Money.png" alt="S" style={{ width: '10px', height: '10px' }} />
                                                            </div>
                                                            <div style={{ color: '#10b981', fontSize: dateData.sales > 9 ? '0.65rem' : '0.55rem', fontWeight: '700' }}>{dateData.sales}</div>
                                                        </div>
                                                    )}
                                                    {dateData.packing > 0 && (
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{
                                                                width: dateData.packing > 9 ? '22px' : '18px',
                                                                height: dateData.packing > 9 ? '22px' : '18px',
                                                                borderRadius: '50%',
                                                                background: 'rgba(139, 92, 246, 0.3)',
                                                                border: '1px solid rgba(139, 92, 246, 0.6)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                margin: '0 auto 2px'
                                                            }}>
                                                                <img src="/assets/icons/Clipboard.png" alt="P" style={{ width: '10px', height: '10px' }} />
                                                            </div>
                                                            <div style={{ color: '#8b5cf6', fontSize: dateData.packing > 9 ? '0.65rem' : '0.55rem', fontWeight: '700' }}>{dateData.packing}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Click Modal with Backdrop Blur */}
            {selectedDate && (
                <div
                    onClick={handleBackdropClick}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: 'var(--spacing-lg)'
                    }}
                >
                    <div
                        className="glass-card"
                        style={{
                            padding: 'var(--spacing-2xl)',
                            maxWidth: '520px',
                            width: '100%',
                            maxHeight: '85vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header with Icon-Only Close */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                            <h3 style={{ color: 'white', fontSize: '1.5rem', margin: 0, fontWeight: '700' }}>
                                {getDateData(selectedDate).date}
                            </h3>
                            <button
                                onClick={() => setSelectedDate(null)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    padding: 0,
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <img src="/assets/icons/Close.png" alt="Close" style={{ width: '18px', height: '18px' }} />
                            </button>
                        </div>

                        {/* Stats Grid - 2x2 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 'var(--spacing-md)',
                            marginBottom: 'var(--spacing-xl)'
                        }}>
                            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#f59e0b' }}>{getDateData(selectedDate).orders}</div>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Orders</div>
                            </div>
                            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#10b981' }}>{getDateData(selectedDate).sales}</div>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Sales</div>
                            </div>
                            <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#22c55e' }}>Rs. {getDateData(selectedDate).salesAmount.toLocaleString()}</div>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Amount</div>
                            </div>
                            <div style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#8b5cf6' }}>{getDateData(selectedDate).packing}</div>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Packing</div>
                            </div>
                        </div>

                        {/* Inventory Section with Icon */}
                        <div>
                            <h4 style={{ color: 'white', marginBottom: 'var(--spacing-md)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src="/assets/icons/Inventory.png" alt="Inventory" style={{ width: '20px', height: '20px' }} />
                                Inventory ({detailedData.inventory.length} items)
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-sm)' }}>
                                {detailedData.inventory
                                    .filter(item => item.product && item.quantity > 0)
                                    .sort((a, b) => b.quantity - a.quantity)
                                    .slice(0, 6)
                                    .map((item, index) => (
                                        <div key={index} style={{
                                            background: 'rgba(6, 182, 212, 0.15)',
                                            border: '1px solid rgba(6, 182, 212, 0.3)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: 'var(--spacing-md)',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#06b6d4' }}>{item.quantity}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '4px' }}>
                                                {item.product?.name || 'Unknown'}
                                            </div>
                                        </div>
                                    ))
                                }
                                {detailedData.inventory.filter(item => item.product && item.quantity > 0).length === 0 && (
                                    <div style={{ color: 'rgba(255,255,255,0.5)', padding: 'var(--spacing-lg)', textAlign: 'center', gridColumn: '1 / -1', fontSize: '0.9rem' }}>
                                        No inventory data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Graphical View Component - Responsive
function GraphicalView({ stats, detailedData, isMobile }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 'var(--spacing-lg)' : 'var(--spacing-2xl)'
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

            {/* Products Chart Box - By Category */}
            <ChartBox
                title="Products by Category"
                barData={calculateProductsByCategory(detailedData.products)}
                pieData={calculateProductsByCategory(detailedData.products)}
            />

            {/* Inventory Chart Box */}
            <ChartBox
                title="Inventory"
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

// Helper function to calculate products by category
function calculateProductsByCategory(products) {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6']

    // Group products by category
    const categoryMap = {}
    products.forEach(product => {
        const category = product.category || 'Uncategorized'
        if (!categoryMap[category]) {
            categoryMap[category] = 0
        }
        categoryMap[category]++
    })

    // Convert to chart data format
    return Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .map(([category, count], index) => ({
            label: category,
            value: count,
            color: colors[index % colors.length]
        }))
}

// Helper function to calculate inventory distribution by individual products (ALL products, sorted by newest first)
function calculateInventoryDistribution(inventory) {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#a855f7', '#22d3ee', '#fb923c', '#4ade80']

    // Get ALL products sorted by most recently added first (created_at)
    const productData = inventory
        .filter(item => item.product && item.quantity > 0)
        .sort((a, b) => {
            // Sort by created_at date (newest first)
            const dateA = new Date(a.created_at || a.updated_at || 0)
            const dateB = new Date(b.created_at || b.updated_at || 0)
            return dateB - dateA
        })
        .map((item, index) => ({
            label: item.product?.name || `Product ${index + 1}`,
            value: item.quantity || 0,
            color: colors[index % colors.length]
        }))

    // If no products with quantity, show stock status
    if (productData.length === 0) {
        const lowStock = inventory.filter(item => (item.quantity || 0) <= (item.reorder_level || 0)).length
        const normalStock = inventory.filter(item => (item.quantity || 0) > (item.reorder_level || 0)).length

        return [
            { label: 'Low Stock', value: lowStock, color: '#ef4444' },
            { label: 'Normal Stock', value: normalStock, color: '#10b981' },
        ].filter(item => item.value > 0)
    }

    return productData
}

// Chart Box Component with Toggle and Expand/Collapse
function ChartBox({ title, barData, pieData }) {
    const [chartType, setChartType] = useState('bar')
    const [isExpanded, setIsExpanded] = useState(false)

    // Get data to display based on expanded state
    const displayBarData = isExpanded ? barData : barData.slice(0, 2)
    const displayPieData = isExpanded ? pieData : pieData.slice(0, 2)

    return (
        <div
            className="glass-card"
            style={{
                padding: 'var(--spacing-2xl)',
                cursor: barData.length > 2 ? 'pointer' : 'default',
                transition: 'all 0.3s ease'
            }}
            onClick={() => barData.length > 2 && setIsExpanded(!isExpanded)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ color: 'white', fontSize: '1.2rem', margin: 0 }}>
                    {title}
                </h3>

                {/* Chart Type Toggle - Circular Icon-Only */}
                <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setChartType('bar')}
                        style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            background: chartType === 'bar' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <img src="/assets/icons/BarChart.png" alt="Bar" style={{ width: '16px', height: '16px' }} />
                    </button>
                    <button
                        onClick={() => setChartType('pie')}
                        style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            background: chartType === 'pie' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <img src="/assets/icons/PieChart.png" alt="Pie" style={{ width: '16px', height: '16px' }} />
                    </button>
                </div>
            </div>

            {/* Chart Display */}
            {chartType === 'bar' ? (
                <BarChart data={displayBarData} />
            ) : (
                <PieChart data={displayPieData} />
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

// Pie Chart Component - Smaller to match bar chart width
function PieChart({ data }) {
    const total = data.reduce((sum, item) => sum + item.value, 0)

    if (total === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'rgba(255,255,255,0.5)' }}>
                No data available
            </div>
        )
    }

    let currentAngle = 0

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-sm)' }}>
            {/* Pie Chart SVG - Smaller to match bar chart */}
            <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                <svg width="180" height="180" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
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
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white' }}>
                        {total}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
                        Total
                    </div>
                </div>
            </div>

            {/* Legend - Below pie, compact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', maxWidth: '220px' }}>
                {data.map((item, index) => {
                    const percentage = ((item.value / total) * 100).toFixed(0)
                    return (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 6px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: `3px solid ${item.color}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: item.color
                                }}></div>
                                <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: '500' }}>
                                    {item.label}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: '700' }}>
                                    {item.value}
                                </span>
                                <span style={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '0.65rem'
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
