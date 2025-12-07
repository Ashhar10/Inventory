import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../supabase/client'

const dashboardCards = [
    {
        id: 'customers',
        image: '/assets/icons/card-customers.png',
        title: 'Customers',
        path: '/customers',
        gradient: 'linear-gradient(135deg, #FC6E20 0%, #c2410c 100%)'
    },
    {
        id: 'products',
        image: '/assets/icons/card-products.png',
        title: 'Products',
        path: '/products',
        gradient: 'linear-gradient(135deg, #323232 0%, #1B1B1B 100%)'
    },
    {
        id: 'orders',
        image: '/assets/icons/card-orders.png',
        title: 'Orders',
        path: '/orders',
        gradient: 'linear-gradient(135deg, #FC6E20 0%, #c2410c 100%)'
    },
    {
        id: 'packing',
        image: '/assets/icons/card-packing.png',
        title: 'Packing',
        path: '/packing',
        gradient: 'linear-gradient(135deg, #323232 0%, #1B1B1B 100%)'
    },
    {
        id: 'sales',
        image: '/assets/icons/card-sales.png',
        title: 'Sales',
        path: '/sales',
        gradient: 'linear-gradient(135deg, #FC6E20 0%, #c2410c 100%)'
    },
    {
        id: 'inventory',
        image: '/assets/icons/card-inventory.png',
        title: 'Inventory',
        path: '/inventory',
        gradient: 'linear-gradient(135deg, #323232 0%, #1B1B1B 100%)'
    },
    {
        id: 'stores',
        image: '/assets/icons/card-stores.png',
        title: 'Stores',
        path: '/stores',
        gradient: 'linear-gradient(135deg, #FC6E20 0%, #c2410c 100%)'
    },
    {
        id: 'users',
        image: '/assets/icons/card-users.png',
        title: 'Add New User',
        path: '/users',
        gradient: 'linear-gradient(135deg, #323232 0%, #1B1B1B 100%)'
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
                    <img src="/assets/icons/stat-customers.png" alt="Customers" style={{ width: '48px', height: '48px', marginBottom: 'var(--spacing-sm)' }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.customers}</div>
                    <div style={{ color: 'var(--text-main)', opacity: 0.8, fontWeight: '600' }}>Total Customers</div>
                </div>

                <div className="glass-card fade-in-up stagger-3" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <img src="/assets/icons/stat-products.png" alt="Products" style={{ width: '48px', height: '48px', marginBottom: 'var(--spacing-sm)' }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.products}</div>
                    <div style={{ color: 'var(--text-main)', opacity: 0.8, fontWeight: '600' }}>Total Products</div>
                </div>

                <div className="glass-card fade-in-up stagger-4" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <img src="/assets/icons/stat-orders.png" alt="Orders" style={{ width: '48px', height: '48px', marginBottom: 'var(--spacing-sm)' }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.pendingOrders}</div>
                    <div style={{ color: 'var(--text-main)', opacity: 0.8, fontWeight: '600' }}>Pending Orders</div>
                </div>

                <div className="glass-card fade-in-up stagger-5" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <img src="/assets/icons/stat-sales.png" alt="Sales" style={{ width: '48px', height: '48px', marginBottom: 'var(--spacing-sm)' }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        Rs. {stats.salesThisMonth.toLocaleString()}
                    </div>
                    <div style={{ color: 'var(--text-main)', opacity: 0.8, fontWeight: '600' }}>Sales This Month</div>
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
                            background: 'var(--bg-surface)'
                        }}
                    >
                        <div className="icon-container" style={{ background: 'transparent' }}>
                            <img src={card.image} alt={card.title} style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                        </div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'var(--text-main)',
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
