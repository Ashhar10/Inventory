import { useState, useEffect } from 'react'
import { db, auth } from '../supabase/client'

function Users() {
    const [loading, setLoading] = useState(false)

    return (
        <div className="container">
            <h1 className="page-title fade-in-up">User Management</h1>
            <div className="glass-card fade-in-up stagger-1" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', minHeight: '400px' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 'var(--spacing-lg)'
                }}>
                    <div style={{ fontSize: '4rem', opacity: 0.3 }}>👥</div>
                    <h2 style={{ color: 'var(--text-main)', marginBottom: 'var(--spacing-md)' }}>
                        User Management Module
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px' }}>
                        Add, edit, and manage system users. Control user permissions and access levels.
                        This module is under development.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Users
