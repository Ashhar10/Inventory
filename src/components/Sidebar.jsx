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
                padding: 'var(--spacing-md) 0',
                height: 'calc(100vh - 80px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                position: 'sticky',
                top: '80px',
                zIndex: 100,
                willChange: 'width'
            }}
        >
            <ul className="sidebar-nav" style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}>
                {navItems.map((item, index) => (
                    <li
                        key={item.path}
                        style={{
                            opacity: 0,
                            animation: `fadeInLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.08}s forwards`,
                            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                    >
                        <NavLink
                            to={item.path}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)',
                                padding: isActive ? 'var(--spacing-lg)' : 'var(--spacing-md)',
                                margin: isActive ? '8px 4px' : '0 var(--spacing-sm)',
                                borderRadius: isActive ? 'var(--radius-xl)' : 'var(--radius-lg)',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: isActive ? '700' : '500',
                                fontSize: isActive ? '1.05rem' : '0.95rem',
                                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                position: 'relative',
                                overflow: 'visible',
                                whiteSpace: 'nowrap',
                                background: isActive
                                    ? 'linear-gradient(135deg, rgba(82, 82, 91, 0.8) 0%, rgba(63, 63, 70, 0.9) 100%)'
                                    : 'transparent',
                                boxShadow: isActive
                                    ? '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                    : 'none',
                                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                                zIndex: isActive ? 10 : 1
                            })}
                        >
                            {/* Active Indicator Glow */}
                            {({ isActive }) => isActive && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '-4px',
                                    width: '4px',
                                    height: '70%',
                                    background: 'linear-gradient(180deg, #E4E4E7 0%, #A1A1AA 100%)',
                                    borderRadius: '0 4px 4px 0',
                                    transform: 'translateY(-50%)',
                                    boxShadow: '0 0 12px rgba(228, 228, 231, 0.6)',
                                    animation: 'pulseGlow 2s ease-in-out infinite'
                                }}></div>
                            )}

                            <div
                                className="sidebar-icon"
                                style={({ isActive }) => ({
                                    minWidth: isActive ? '40px' : '32px',
                                    width: isActive ? '40px' : '32px',
                                    height: isActive ? '40px' : '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    filter: isActive ? 'brightness(1.4) drop-shadow(0 4px 8px rgba(228, 228, 231, 0.3))' : 'brightness(1.2)',
                                    transform: isActive ? 'rotate(0deg)' : 'rotate(0deg)'
                                })}
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
                                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    letterSpacing: '0.4px',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.4)'
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
                        transform: translateX(-30px) scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
                
                @keyframes pulseGlow {
                    0%, 100% {
                        opacity: 1;
                        box-shadow: 0 0 12px rgba(228, 228, 231, 0.6);
                    }
                    50% {
                        opacity: 0.7;
                        box-shadow: 0 0 20px rgba(228, 228, 231, 0.9);
                    }
                }
                
                /* Hover effects for non-active items */
                .sidebar-link:not(.active):hover {
                    background: rgba(82, 82, 91, 0.3) !important;
                    transform: translateX(4px) scale(1.02) !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                
                .sidebar-link:not(.active):hover .sidebar-icon {
                    transform: scale(1.15) rotate(5deg);
                    filter: brightness(1.3);
                }
                
                /* Active item hover enhancement */
                .sidebar-link.active:hover {
                    transform: scale(1.12) !important;
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
                }
                
                .sidebar-link.active:hover .sidebar-icon {
                    transform: scale(1.1) rotate(-2deg);
                }
                
                /* Smooth scrollbar */
                .sidebar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .sidebar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                }
                
                .sidebar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                
                .sidebar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    )
}

export default Sidebar
