import { auth } from '../supabase/client'

function Navbar({ user }) {
    const handleLogout = async () => {
        try {
            await auth.signOut()
            window.location.reload()
        } catch (error) {
            console.error('Error logging out:', error)
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img src="/assets/icons/logo.png" alt="Logo" className="navbar-logo" />
                <span className="company-name">Pakistan Wire Industries</span>
            </div>
            <div className="navbar-user">
                <span className="user-email">{user?.email || 'Admin'}</span>
                <button onClick={handleLogout} className="btn btn-secondary">
                    Logout
                </button>
            </div>

            <style>{`
                .navbar {
                    background: rgba(39, 39, 42, 0.8);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 1rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                }
                
                .navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .navbar-logo {
                    width: 36px;
                    height: 36px;
                    object-fit: contain;
                }
                
                .company-name {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--text-main);
                }
                
                .navbar-user {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .user-email {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                
                /* Mobile styles */
                @media (max-width: 768px) {
                    .navbar {
                        padding: 0.75rem 1rem;
                    }
                    
                    .navbar-logo {
                        width: 28px;
                        height: 28px;
                    }
                    
                    .company-name {
                        font-size: 0.9rem;
                    }
                    
                    .user-email {
                        display: none;
                    }
                    
                    .btn {
                        padding: 0.4rem 0.8rem;
                        font-size: 0.75rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .company-name {
                        font-size: 0.8rem;
                        max-width: 150px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    
                    .btn {
                        padding: 0.3rem 0.6rem;
                        font-size: 0.7rem;
                    }
                }
            `}</style>
        </nav>
    )
}

export default Navbar
