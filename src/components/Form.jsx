import { useState, useEffect } from 'react'
import formCache from '../utils/formCache'

function Form({ fields, onSubmit, onCancel, initialData = {}, submitLabel = 'Submit', formId }) {
    // Restore cached data if available
    const getCachedOrInitialData = () => {
        if (formId) {
            const cached = formCache.load(formId)
            if (cached) {
                // Merge cached data with initial data (cached takes priority)
                return { ...initialData, ...cached }
            }
        }
        return initialData
    }

    const [formData, setFormData] = useState(getCachedOrInitialData())
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [hasCachedData, setHasCachedData] = useState(false)

    // Check if we loaded cached data on mount
    useEffect(() => {
        if (formId) {
            const cached = formCache.load(formId)
            setHasCachedData(!!cached)
        }
    }, [formId])

    // Auto-save form data when it changes
    useEffect(() => {
        if (formId && Object.keys(formData).length > 0) {
            // Debounce the save operation
            const timeoutId = setTimeout(() => {
                formCache.save(formId, formData)
            }, 500) // Save after 500ms of inactivity

            return () => clearTimeout(timeoutId)
        }
    }, [formData, formId])

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    const validate = () => {
        const newErrors = {}
        fields.forEach((field) => {
            if (field.required && !formData[field.name]) {
                newErrors[field.name] = `${field.label} is required`
            }
        })
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)
        try {
            await onSubmit(formData)
            // Clear cache on successful submission
            if (formId) {
                formCache.clear(formId)
                setHasCachedData(false)
            }
        } catch (error) {
            console.error('Form submission error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        // Clear cache when user explicitly cancels
        if (formId) {
            formCache.clear(formId)
            setHasCachedData(false)
        }
        if (onCancel) onCancel()
    }

    const handleClearCache = () => {
        if (formId) {
            formCache.clear(formId)
            setFormData(initialData)
            setHasCachedData(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {hasCachedData && (
                <div style={{
                    padding: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-lg)',
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.9rem'
                }}>
                    <span>💾 Restored unsaved data from previous session</span>
                    <button
                        type="button"
                        onClick={handleClearCache}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        Clear
                    </button>
                </div>
            )}

            {fields.map((field) => (
                <div key={field.name} className="form-group">
                    <label className="form-label">
                        {field.label}
                        {field.required && <span style={{ color: 'red' }}>*</span>}
                    </label>

                    {field.type === 'textarea' ? (
                        <textarea
                            className="form-textarea"
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                        />
                    ) : field.type === 'select' ? (
                        <select
                            className="form-select"
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        >
                            <option value="">Select {field.label}</option>
                            {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            className="form-input"
                            type={field.type || 'text'}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                        />
                    )}

                    {errors[field.name] && (
                        <div className="form-error">{errors[field.name]}</div>
                    )}
                </div>
            ))}

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : submitLabel}
                </button>
                {onCancel && (
                    <button type="button" onClick={handleCancel} className="btn btn-secondary">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    )
}

export default Form
