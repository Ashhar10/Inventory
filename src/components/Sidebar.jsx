import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logo from '/assets/icons/Dashboard.png' // Fallback icon

function Sidebar({ user }) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Define all nav items with optional adminOnly flag
    const allNavItems = [
        { path: '/', label: 'Dashboard', icon: '/assets/icons/Dashboard.png' },
        { path: '/customers', label: 'Customers', icon: '/assets/icons/Customers.png' },
        { path: '/products', label: 'Products', icon: '/assets/icons/Products.png' },
        { path: '/inventory', label: 'Inventory', icon: '/assets/icons/Inventory.png' },
        { path: '/orders', label: 'Orders', icon: '/assets/icons/Orders.png' },
        { path: '/packing', label: 'Packing', icon: '/assets/icons/Packing.png' },
        { path: '/sales', label: 'Sales', icon: '/assets/icons/Sales.png' },
        { path: '/reports', label: 'Reports', icon: '/assets/icons/Reports.png' },
        { path: '/activity-log', label: 'Activity Log', icon: '/assets/icons/Activity.png', adminOnly: true }
    ]

    // Filter nav items based on user role - Activity Log only visible to admins
    const navItems = allNavItems.filter(item => {
        if (item.adminOnly) {
            return user?.role === 'admin'
        }
        return true
    })

    // Mobile Menu Button Logic
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    // 3-Dot Button Icon
    const menuIcon = '/assets/icons/Menu.png'

    useEffect(() => {
        let timer
        if (isMenuOpen) {
            // Auto-close after 5 seconds (restored to 5s or user's preference? User changed to 1s? 
            // User said "5 second of nowhere clicked". 
            // But manually edited to 1000.
            // I'll stick to 5000 as per prompt text "5 second of nowhere clicked". The 1000 might have been a test.
            timer = setTimeout(() => setIsMenuOpen(false), 5000)

            const handleInteraction = (e) => {
                // If clicking inside menu, reset timer
                if (e.target.closest('.mobile-bottom-nav')) {
                    clearTimeout(timer)
                    timer = setTimeout(() => setIsMenuOpen(false), 5000)
                    return
                }
                // If clicking outside, close immediately
                setIsMenuOpen(false)
            }

            window.addEventListener('click', handleInteraction)
            window.addEventListener('touchstart', handleInteraction)

            return () => {
                clearTimeout(timer)
                window.removeEventListener('click', handleInteraction)
                window.removeEventListener('touchstart', handleInteraction)
            }
        }
    }, [isMenuOpen])

    return (
        <>
            {/* Mobile Menu Toggle Button */}
            <button
                className={`mobile-menu-btn ${isMenuOpen ? 'hidden' : ''}`}
                onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(true)
                }}
            >
                <img
                    src={menuIcon}
                    alt="Menu"
                    onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentNode.classList.add('fallback-dots')
                    }}
                />
                <div className="dots-fallback">
                    <span></span><span></span><span></span>
                </div>
            </button>

            {/* Mobile Bottom Navigation */}
            <nav className={`mobile-bottom-nav ${isMenuOpen ? 'visible' : ''}`}>
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
