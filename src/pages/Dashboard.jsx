import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../supabase/client'

const dashboardCards = [
    {
        id: 'customers',
        icon: '👥',
        title: 'Customers',
        path: '/customers',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        id: 'products',
        icon: '📦',
        title: 'Products',
        path: '/products',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
        id: 'orders',
        icon: '📋',
        title: 'Orders',
        path: '/orders',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
        id: 'packing',
        icon: '📦',
        title: 'Packing',
        path: '/packing',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
        id: 'sales',
        icon: '💰',
        title: 'Sales',
        path: '/sales',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
        id: 'inventory',
        icon: '🏢',
        title: 'Inventory',
        path: '/inventory',
        gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    },
    {
        id: 'stores',
        icon: '🏪',
        title: 'Stores',
        path: '/stores',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
        id: 'users',
        icon: '👤➕',
        title: 'Add New User',
        path: '/users',
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    },
]

function Dashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        customers: 0,
        products: 0,
        pendingOrders: 0,
        salesThisMonth: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const data = await db.getDashboardStats()
            setStats(data)
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCardClick = (path) => {
        navigate(path)
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
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-3xl)' }}>
                <h1 className="page-title fade-in-up">
                    Pakistan Wire Industries (Pvt.) LTD
                </h1>
                <p style={{
                    fontSize: '1.5rem',
                    color: 'white',
                    fontWeight: '600',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                }} className="fade-in-up stagger-1">
                    📊 Inventory Dashboard
                </p>
            </div>

            {/* Quick Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-3xl)'
            }}>
                <div className="glass-card fade-in-up stagger-2" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>👥</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>{stats.customers}</div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Total Customers</div>
                </div>

                <div className="glass-card fade-in-up stagger-3" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📦</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>{stats.products}</div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Total Products</div>
                </div>

                <div className="glass-card fade-in-up stagger-4" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📋</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>{stats.pendingOrders}</div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Pending Orders</div>
                </div>

                <div className="glass-card fade-in-up stagger-5" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>💰</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>
                        Rs. {stats.salesThisMonth.toLocaleString()}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Sales This Month</div>
                </div>
            </div>

            {/* Main Dashboard Cards */}
            <div className="dashboard-grid">
                {dashboardCards.map((card, index) => (
                    <div
                        key={card.id}
                        className={`card-3d card-glow dashboard-card fade-in-up stagger-${index + 1}`}
                        onClick={() => handleCardClick(card.path)}
                        style={{
                            background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)`
                        }}
                    >
                        <div className="icon-container" style={{ background: card.gradient }}>
                            <div style={{ fontSize: '3rem' }}>{card.icon}</div>
                        </div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'var(--primary-700)',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            {card.title}
                        </h3>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Dashboard
