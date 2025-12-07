import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './supabase/client'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard.jsx'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Sales from './pages/Sales'
import Reports from './pages/Reports'

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
            {!user ? (
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            ) : (
                <div style={{ minHeight: '100vh' }}>
                    <div className="animated-background"></div>
                    <Navbar user={user} />
                    <div style={{ display: 'flex' }}>
                        <Sidebar />
                        <main style={{ flex: 1, minHeight: 'calc(100vh - 80px)' }}>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/customers" element={<Customers />} />
                                <Route path="/products" element={<Products />} />
                                <Route path="/inventory" element={<Inventory />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/sales" element={<Sales />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            )}
        </BrowserRouter>
    )
}

export default App
