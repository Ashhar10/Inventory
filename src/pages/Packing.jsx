import { useState, useEffect } from 'react'
import { db } from '../supabase/client'

function Packing() {
    const [loading, setLoading] = useState(false)

    return (
        <div className="container">
            <h1 className="page-title fade-in-up">Packing Management</h1>
            <div className="glass-card fade-in-up stagger-1" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', minHeight: '400px' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 'var(--spacing-lg)'
                }}>
                    <div style={{ fontSize: '4rem', opacity: 0.3 }}>📦</div>
                    <h2 style={{ color: 'var(--text-main)', marginBottom: 'var(--spacing-md)' }}>
                        Packing Module
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px' }}>
                        Manage your packing operations, track packaged orders, and monitor packing efficiency.
                        This module is under development.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Packing
