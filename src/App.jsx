import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './supabase/client'
import Background3D from './components/Background3D'
import ClientCarousel from './components/ClientCarousel'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard.jsx'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Sales from './pages/Sales'
import Reports from './pages/Reports'
import Packing from './pages/Packing'
import Stores from './pages/Stores'
import Users from './pages/Users'
import ActivityLog from './pages/ActivityLog'

// Components
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

function App() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check current session from localStorage
        auth.getSession().then((session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes using custom event system
        const { data: authListener } = auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => {
            authListener?.subscription?.unsubscribe()
        }
    }, [])

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <BrowserRouter>
            <Background3D />

            {/* Client Carousel - Fixed on all pages */}
            <ClientCarousel />

            {!user ? (
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            ) : (
                <div className="app-container">
                    <Navbar user={user} />
                    <div className="app-layout">
                        <Sidebar user={user} />
                        <main className="app-content">
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/customers" element={<Customers />} />
                                <Route path="/products" element={<Products />} />
                                <Route path="/inventory" element={<Inventory />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/sales" element={<Sales />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="/packing" element={<Packing />} />
                                <Route path="/stores" element={<Stores />} />
                                <Route path="/users" element={<Users />} />
                                <Route path="/activity-log" element={<ActivityLog />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            )}

            <style>{`
                .app-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    padding-bottom: 60px; /* Space for fixed bottom carousel */
                }
                
                .app-layout {
                    display: flex;
                    flex: 1;
                }
                
                .app-content {
                    flex: 1;
                    padding: 2rem;
                    overflow-x: hidden;
                }
                
                @media (max-width: 768px) {
                    .app-container {
                        padding-bottom: 0;
                        padding-right: 40px; /* Space for right side carousel */
                    }
                    
                    .app-layout {
                        flex-direction: column;
                    }
                    
                    .app-content {
                        padding: 1rem;
                        padding-bottom: 80px;
                    }
                }
                
                @media (max-width: 480px) {
                    .app-container {
                        padding-right: 36px;
                    }
                    
                    .app-content {
                        padding: 0.75rem;
                        padding-bottom: 80px;
                    }
                }
            `}</style>
        </BrowserRouter>
    )
}

export default App
