import { auth } from '../supabase/client'

function Navbar({ user }) {
    const handleLogout = async () => {
        await auth.signOut()
        window.location.href = '/login'
    }

    return (
        <nav className="navbar">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '100%', margin: '0 auto' }}>
                <div className="navbar-brand">
                    🏭 Pakistan Wire Industries (Pvt.) LTD
                </div>

                <div className="flex gap-lg" style={{ alignItems: 'center' }}>
                    <span style={{ color: 'white', fontWeight: '500' }}>
                        📊 Inventory Dashboard
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>
                                {user?.email || 'User'}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                                Administrator
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                            <img src="/assets/icons/Logout.png" alt="Logout" style={{ width: '20px', height: '20px', marginRight: '0.5rem' }} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
