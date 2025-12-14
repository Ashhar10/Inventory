import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../supabase/client'

const dashboardCards = [
    {
        id: 'customers',
        image: '/assets/icons/Customers.png',
        title: 'Customers',
        path: '/customers',
    },
    {
        id: 'products',
        image: '/assets/icons/Products.png',
        title: 'Products',
        path: '/products',
    },
    {
        id: 'orders',
        image: '/assets/icons/Orders.png',
        title: 'Orders',
        path: '/orders',
    },
    {
        id: 'packing',
        image: '/assets/icons/Packing.png',
        title: 'Packing',
        path: '/packing',
    },
    {
        id: 'sales',
        image: '/assets/icons/Sales.png',
        title: 'Sales',
        path: '/sales',
    },
    {
        id: 'inventory',
        image: '/assets/icons/Inventory.png',
        title: 'Inventory',
        path: '/inventory',
    },
    {
        id: 'stores',
        image: '/assets/icons/Stores.png',
        title: 'Stores',
        path: '/stores',
    },
    {
        id: 'users',
        image: '/assets/icons/Users.png',
        title: 'Add New User',
        path: '/users',
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
        <>
            <div className="container responsive-container">
                <div className="dashboard-header">
                    <h1 className="page-title fade-in-up">
                        Pakistan Wire Industries (Pvt.) LTD
                    </h1>
                    <p className="dashboard-subtitle fade-in-up stagger-1">
                        Inventory Dashboard
                    </p>
                </div>

                <div className="stats-grid fade-in-up stagger-2">
                    <div className="glass-card stat-card">
                        <div className="stat-value">{stats.customers}</div>
                        <div className="stat-label">Total Customers</div>
                    </div>

                    <div className="glass-card stat-card">
                        <div className="stat-value">{stats.products}</div>
                        <div className="stat-label">Total Products</div>
                    </div>

                    <div className="glass-card stat-card">
                        <div className="stat-value">{stats.pendingOrders}</div>
                        <div className="stat-label">Pending Orders</div>
                    </div>

                    <div className="glass-card stat-card">
                        <div className="stat-value">Rs. {stats.salesThisMonth.toLocaleString()}</div>
                        <div className="stat-label">Sales This Month</div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    {dashboardCards.map((card, index) => (
                        <div
                            key={card.id}
                            className={`card-3d card-glow dashboard-card fade-in-up stagger-${index + 1}`}
                            onClick={() => handleCardClick(card.path)}
                            title={card.title}
                        >
                            <div className="icon-container">
                                <img src={card.image} alt={card.title} />
                            </div>
                            <h3 className="card-title">{card.title}</h3>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .responsive-container {
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .dashboard-header {
                    text-align: center;
                    margin-bottom: var(--spacing-3xl);
                }

                .dashboard-subtitle {
                    font-size: 1.5rem;
                    color: white;
                    font-weight: 600;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                    margin-top: var(--spacing-md);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-lg);
                    margin-bottom: var(--spacing-3xl);
                }

                .stat-card {
                    padding: var(--spacing-lg);
                    text-align: center;
                    min-height: 100px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    margin-bottom: var(--spacing-sm);
                }

                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--text-main);
                    margin-bottom: var(--spacing-xs);
                }

                .stat-label {
                    color: var(--text-main);
                    opacity: 0.8;
                    font-weight: 500;
                    font-size: 0.85rem;
                    line-height: 1.4;
                    text-align: center;
                    word-wrap: break-word;
                    max-width: 100%;
                }

                .dashboard-card .icon-container {
                    background: transparent !important;
                }

                .dashboard-card .icon-container img {
                    width: 64px;
                    height: 64px;
                    object-fit: contain;
                    filter: brightness(0);
                }

                .card-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-main);
                    position: relative;
                    z-index: 2;
                    margin-top: var(--spacing-md);
                    white-space: nowrap;
                    text-align: center;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    transition: all 0.3s ease;
                }

                .dashboard-card:hover .card-title {
                    white-space: normal;
                    overflow: visible;
                    text-overflow: unset;
                    word-break: break-word;
                }

                @media (max-width: 768px) {
                    .dashboard-header {
                        margin-bottom: var(--spacing-xl);
                    }

                    .page-title {
                        font-size: 1.5rem !important;
                        padding: 0 var(--spacing-md);
                    }

                    .dashboard-subtitle {
                        font-size: 1.1rem;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: var(--spacing-md);
                    }

                    .stat-card {
                        padding: var(--spacing-md);
                        min-height: 120px;
                    }

                    .stat-icon {
                        width: 32px;
                        height: 32px;
                    }

                    .stat-value {
                        font-size: 1.5rem;
                    }

                    .stat-label {
                        font-size: 0.75rem;
                    }

                    .dashboard-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: var(--spacing-md) !important;
                    }

                    .dashboard-card {
                        padding: var(--spacing-lg) !important;
                    }

                    .dashboard-card .icon-container img {
                        width: 48px !important;
                        height: 48px !important;
                    }

                    .card-title {
                        font-size: 1.1rem !important;
                    }
                }

                @media (max-width: 480px) {
                    .page-title {
                        font-size: 1.2rem !important;
                    }

                    .dashboard-subtitle {
                        font-size: 1rem;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: var(--spacing-sm);
                    }

                    .dashboard-grid {
                        grid-template-columns: 1fr !important;
                        gap: var(--spacing-sm) !important;
                    }

                    .dashboard-card {
                        padding: var(--spacing-md) !important;
                    }

                    .card-title {
                        font-size: 1rem !important;
                    }
                }
            `}</style>
        </>
    )
}

export default Dashboard
