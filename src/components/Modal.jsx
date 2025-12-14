import { useEffect, useRef } from 'react'

function Modal({ isOpen, onClose, title, message, type = 'info', onConfirm, showCancel = false }) {
    const hasHandledRef = useRef(false)

    useEffect(() => {
        // Reset handled flag when modal opens
        if (isOpen) {
            hasHandledRef.current = false
        }
    }, [isOpen])

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && !hasHandledRef.current) {
                hasHandledRef.current = true
                onClose()
            }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const icons = {
        success: '',
        error: '',
        warning: '',
        info: '',
        confirm: '',
    }

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        confirm: '#8b5cf6',
    }

    const handleOverlayClick = () => {
        if (!hasHandledRef.current) {
            hasHandledRef.current = true
            onClose()
        }
    }

    const handleConfirmClick = () => {
        if (!hasHandledRef.current) {
            hasHandledRef.current = true
            if (onConfirm) onConfirm()
            onClose()
        }
    }

    const handleCancelClick = () => {
        if (!hasHandledRef.current) {
            hasHandledRef.current = true
            onClose()
        }
    }

    return (
        <div className="modal-overlay" onClick={handleOverlayClick} style={{ zIndex: 30000 }}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '500px', animation: 'slideUp 0.3s ease-out' }}
            >

                {title && (
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: colors[type],
                        marginBottom: 'var(--spacing-xl)',
                        textAlign: 'center'
                    }}>
                        {title}
                    </h2>
                )}

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
                            onClick={handleCancelClick}
                            className="btn btn-secondary"
                            style={{ minWidth: '120px' }}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleConfirmClick}
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
