import { NavLink } from 'react-router-dom'
import { useState } from 'react'

function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false)

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/customers', label: 'Customers', icon: '👥' },
        { path: '/products', label: 'Products', icon: '📦' },
        { path: '/inventory', label: 'Inventory', icon: '📋' },
        { path: '/orders', label: 'Orders', icon: '🛒' },
        { path: '/sales', label: 'Sales', icon: '💰' },
        { path: '/reports', label: 'Reports', icon: '📈' }
    ]

    return (
        <div
            className={`sidebar ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            style={{
                width: isExpanded ? '240px' : '70px',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'rgba(39, 39, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                padding: 'var(--spacing-xl) 0',
                height: 'calc(100vh - 80px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                position: 'sticky',
                top: '80px',
                zIndex: 100
            }}
        >
            <ul className="sidebar-nav" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {navItems.map((item) => (
                    <li key={item.path} style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)',
                                padding: 'var(--spacing-md)',
                                margin: '0 var(--spacing-sm)',
                                borderRadius: 'var(--radius-lg)',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span
                                className="sidebar-icon"
                                style={{
                                    fontSize: '1.5rem',
                                    minWidth: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {item.icon}
                            </span>
                            <span
                                className="sidebar-label"
                                style={{
                                    opacity: isExpanded ? 1 : 0,
                                    transform: isExpanded ? 'translateX(0)' : 'translateX(-10px)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontSize: '0.95rem'
                                }}
                            >
                                {item.label}
                            </span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Sidebar
