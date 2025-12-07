import { Link, useLocation } from 'react-router-dom'

const menuItems = [
    { path: '/', image: '/assets/icons/nav-dashboard.png', label: 'Dashboard' },
    { path: '/customers', image: '/assets/icons/nav-customers.png', label: 'Customers' },
    { path: '/products', image: '/assets/icons/nav-products.png', label: 'Products' },
    { path: '/inventory', image: '/assets/icons/nav-inventory.png', label: 'Inventory' },
    { path: '/orders', image: '/assets/icons/nav-orders.png', label: 'Orders' },
    { path: '/sales', image: '/assets/icons/nav-sales.png', label: 'Sales' },
    { path: '/reports', image: '/assets/icons/nav-reports.png', label: 'Reports' },
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
                                <img
                                    src={item.image}
                                    alt={item.label}
                                    style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.innerText = item.label; // Fallback text logic if needed
                                    }}
                                />
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
