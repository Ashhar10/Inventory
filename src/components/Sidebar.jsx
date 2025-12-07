import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '/assets/icons/Dashboard.png' },
        { path: '/customers', label: 'Customers', icon: '/assets/icons/Customers.png' },
        { path: '/products', label: 'Products', icon: '/assets/icons/Products.png' },
        { path: '/inventory', label: 'Inventory', icon: '/assets/icons/Inventory.png' },
        { path: '/orders', label: 'Orders', icon: '/assets/icons/Orders.png' },
        { path: '/sales', label: 'Sales', icon: '/assets/icons/Sales.png' },
        { path: '/reports', label: 'Reports', icon: '/assets/icons/Reports.png' }
    ]

    if (isMobile) {
        // Mobile bottom navigation
        return (
            <nav className="mobile-bottom-nav">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
                                <img src={item.icon} alt={item.label} onError={(e) => e.target.style.display = 'none'} />
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        )
    }

    // Desktop sidebar
    return (
        <div
            className="sidebar"
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
                zIndex: 100
            }}
        >
            <nav>
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                }}>
                    {navItems.map((item, index) => (
                        <li
                            key={item.path}
                            style={{
                                opacity: 0,
                                animation: `fadeInSidebar 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.08}s forwards`
                            }}
                        >
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && <div className="sidebar-glow-indicator"></div>}

                                        <div className="sidebar-icon-wrapper">
                                            <img
                                                src={item.icon}
                                                alt={item.label}
                                                className={`sidebar-icon ${isActive ? 'active' : ''}`}
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>

                                        <span className={`sidebar-label ${isExpanded ? 'visible' : ''}`}>
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <style>{`
                @keyframes fadeInSidebar {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
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
                
                .sidebar-link {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-md);
                    margin: 0;
                    border-radius: var(--radius-lg);
                    color: white;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.95rem;
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                    white-space: nowrap;
                    background: transparent;
                }
                
                .sidebar-link.active {
                    background: linear-gradient(135deg, rgba(82, 82, 91, 0.8) 0%, rgba(63, 63, 70, 0.9) 100%);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    padding: var(--spacing-lg) var(--spacing-md);
                    margin: 4px 0;
                    border-radius: var(--radius-xl);
                    font-weight: 700;
                }
                
                .sidebar-glow-indicator {
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 70%;
                    background: linear-gradient(180deg, #E4E4E7 0%, #A1A1AA 100%);
                    border-radius: 0 4px 4px 0;
                    box-shadow: 0 0 12px rgba(228, 228, 231, 0.6);
                    animation: pulseGlow 2s ease-in-out infinite;
                }
                
                .sidebar-icon-wrapper {
                    min-width: 32px;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .sidebar-icon {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    filter: brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                .sidebar-icon.active {
                    filter: brightness(1.5) drop-shadow(0 4px 8px rgba(228, 228, 231, 0.4));
                    transform: scale(1.15);
                }
                
                .sidebar-label {
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    letter-spacing: 0.3px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.4);
                }
                
                .sidebar-label.visible {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                .sidebar-link:not(.active):hover {
                    background: rgba(82, 82, 91, 0.3);
                    transform: translateX(3px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                
                .sidebar-link:not(.active):hover .sidebar-icon {
                    transform: scale(1.1) rotate(3deg);
                    filter: brightness(1.3);
                }
                
                .sidebar-link.active:hover {
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15);
                }
                
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
                
                /* Mobile Bottom Nav */
                .mobile-bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(39, 39, 42, 0.95);
                    backdrop-filter: blur(20px);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 8px 0;
                    z-index: 1000;
                    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
                }
                
                .mobile-bottom-nav ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                }
                
                .mobile-bottom-nav li {
                    flex: 1;
                    text-align: center;
                }
                
                .mobile-bottom-nav a {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 4px;
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    font-size: 0.65rem;
                    transition: all 0.3s;
                }
                
                .mobile-bottom-nav a.active {
                    color: #E4E4E7;
                    background: rgba(82, 82, 91, 0.5);
                    border-radius: 8px;
                }
                
                .mobile-bottom-nav img {
                    width: 22px;
                    height: 22px;
                    object-fit: contain;
                    filter: brightness(1.2);
                }
                
                .mobile-bottom-nav a.active img {
                    filter: brightness(1.5);
                }
            `}</style>
        </div>
    )
}

export default Sidebar
