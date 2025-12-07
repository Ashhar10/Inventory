import { useEffect } from 'react'

function Modal({ isOpen, onClose, title, message, type = 'info', onConfirm, showCancel = false }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        confirm: '❓',
    }

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        confirm: '#8b5cf6',
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '500px', animation: 'slideUp 0.3s ease-out' }}
            >
                <div style={{
                    textAlign: 'center',
                    marginBottom: 'var(--spacing-xl)',
                    paddingBottom: 'var(--spacing-lg)',
                    borderBottom: `2px solid ${colors[type]}`
                }}>
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        {icons[type]}
                    </div>
                    {title && (
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: colors[type],
                            marginBottom: 'var(--spacing-sm)'
                        }}>
                            {title}
                        </h2>
                    )}
                </div>

                <div style={{
                    fontSize: '1.1rem',
                    color: 'var(--gray-700)',
                    marginBottom: 'var(--spacing-2xl)',
                    lineHeight: '1.6',
                    textAlign: 'center'
                }}>
                    {message}
                </div>

                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    justifyContent: 'center'
                }}>
                    {showCancel && (
                        <button
                            onClick={onClose}
                            className="btn btn-secondary"
                            style={{ minWidth: '120px' }}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm()
                            onClose()
                        }}
                        className={`btn ${type === 'error' ? 'btn-danger' : 'btn-primary'}`}
                        style={{ minWidth: '120px' }}
                    >
                        {showCancel ? 'Confirm' : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Modal
