import { useState } from 'react'
import { auth } from '../supabase/client'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { data, error: signInError } = await auth.signIn(email, password)

        if (signInError) {
            setError(signInError.message || 'Failed to login. Please check your credentials.')
            setLoading(false)
        } else {
            // Redirect to dashboard
            window.location.href = '/'
        }
    }

    return (
        <div className="glass-card fade-in-up" style={{
            maxWidth: '500px',
            width: '90%',
            padding: 'var(--spacing-3xl)',
            position: 'relative',
            zIndex: 1
        }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    color: 'white',
                    marginBottom: 'var(--spacing-md)',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                    Pakistan Wire Industries
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: '600'
                }}>
                    Inventory Dashboard
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid rgba(239, 68, 68, 0.5)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-md)',
                        marginBottom: 'var(--spacing-lg)',
                        color: 'white',
                        fontWeight: '500'
                    }}>
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label" style={{ color: 'white' }}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        className="form-input"
                        placeholder="admin@pakistanwire.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ fontSize: '1rem' }}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ color: 'white' }}>
                        Password
                    </label>
                    <input
                        type="password"
                        className="form-input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ fontSize: '1rem' }}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: '100%', padding: 'var(--spacing-lg)', fontSize: '1.1rem', marginTop: 'var(--spacing-lg)' }}
                >
                    {loading ? 'Logging in...' : 'Login to Dashboard'}
                </button>
            </form>
        </div>
    )
}

export default Login
