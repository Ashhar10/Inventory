import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logo from '/assets/icons/Dashboard.png' // Fallback icon

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

    // Auto-hide mobile nav logic
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        let timer
        const resetTimer = () => {
            setIsVisible(true)
            clearTimeout(timer)
            timer = setTimeout(() => setIsVisible(false), 1000)
        }

        // Listen for interactions
        window.addEventListener('click', resetTimer)
        window.addEventListener('touchstart', resetTimer)
        window.addEventListener('scroll', resetTimer)

        resetTimer() // Start timer on mount

        return () => {
            window.removeEventListener('click', resetTimer)
            window.removeEventListener('touchstart', resetTimer)
            window.removeEventListener('scroll', resetTimer)
            clearTimeout(timer)
        }
    }, [])

    return (
        <>
            {/* Mobile Bottom Navigation - Visible only on mobile via CSS */}
            <nav className={`mobile-bottom-nav ${!isVisible ? 'hidden' : ''}`}>
                <ul>
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
                                <img
                                    src={item.icon}
                                    alt={item.label}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = logo
                                    }}
                                />
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Desktop Sidebar - Visible only on desktop via CSS */}
            <div
                className={`sidebar ${isExpanded ? 'expanded' : ''}`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <nav>
                    <ul>
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
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = logo
                                                    }}
                                                />
                                            </div>

                                            <span className="sidebar-label">
                                                {item.label}
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    )
}

export default Sidebar
