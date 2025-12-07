import { NavLink } from 'react-router-dom'
import { useState } from 'react'

function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false)

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '/assets/icons/Dashboard.png' },
        { path: '/customers', label: 'Customers', icon: '/assets/icons/Customers.png' },
        { path: '/products', label: 'Products', icon: '/assets/icons/Products.png' },
        { path: '/inventory', label: 'Inventory', icon: '/assets/icons/Inventory.png' },
        { path: '/orders', label: 'Orders', icon: '/assets/icons/Orders.png' },
        { path: '/sales', label: 'Sales', icon: '/assets/icons/Sales.png' },
        { path: '/reports', label: 'Reports', icon: '/assets/icons/Reports.png' }
    ]

    return (
        <div
            className={`sidebar ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            style={{
                width: isExpanded ? '240px' : '70px',
                transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                background: 'rgba(39, 39, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                padding: 'var(--spacing-xl) 0',
                height: 'calc(100vh - 80px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                position: 'sticky',
                top: '80px',
                zIndex: 100,
                willChange: 'width'
            }}
        >
            <ul className="sidebar-nav" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {navItems.map((item, index) => (
                    <li
                        key={item.path}
                        style={{
                            marginBottom: 'var(--spacing-sm)',
                            opacity: 0,
                            animation: `fadeInLeft 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s forwards`
                        }}
                    >
                        <NavLink
                            to={item.path}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)',
                                padding: 'var(--spacing-md)',
                                margin: '0 var(--spacing-sm)',
                                borderRadius: 'var(--radius-lg)',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: '500',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                background: isActive ? 'rgba(82, 82, 91, 0.5)' : 'transparent',
                                borderLeft: isActive ? '3px solid rgba(228, 228, 231, 0.8)' : '3px solid transparent'
                            })}
                        >
                            <div
                                className="sidebar-icon"
                                style={{
                                    minWidth: '32px',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    filter: 'brightness(1.2)'
                                }}
                            >
                                <img
                                    src={item.icon}
                                    alt={item.label}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                            </div>
                            <span
                                className="sidebar-label"
                                style={{
                                    opacity: isExpanded ? 1 : 0,
                                    transform: isExpanded ? 'translateX(0)' : 'translateX(-10px)',
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    fontSize: '0.95rem',
                                    letterSpacing: '0.3px',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                }}
                            >
                                {item.label}
                            </span>
                        </NavLink>
                    </li>
                ))}
            </ul>

            <style>{`
                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .sidebar-link:hover .sidebar-icon {
                    transform: scale(1.15) rotate(5deg);
                }
                
                .sidebar-link:hover {
                    background: rgba(82, 82, 91, 0.4) !important;
                    transform: translateX(3px);
                }
                
                .sidebar-link.active:hover {
                    background: rgba(82, 82, 91, 0.6) !important;
                }
            `}</style>
        </div>
    )
}

export default Sidebar
