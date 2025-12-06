import { Link, useLocation } from 'react-router-dom'

const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/customers', icon: '👥', label: 'Customers' },
    { path: '/products', icon: '📦', label: 'Products' },
    { path: '/inventory', icon: '🏢', label: 'Inventory' },
    { path: '/orders', icon: '📋', label: 'Orders' },
    { path: '/sales', icon: '💰', label: 'Sales' },
    { path: '/reports', icon: '📈', label: 'Reports' },
]

function Sidebar() {
    const location = useLocation()

    return (
        <aside className="sidebar" style={{ width: '250px' }}>
            <nav>
                <ul className="sidebar-nav">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar
