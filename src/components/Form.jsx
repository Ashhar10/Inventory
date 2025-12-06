import { useState } from 'react'

function Form({ fields, onSubmit, onCancel, initialData = {}, submitLabel = 'Submit' }) {
    const [formData, setFormData] = useState(initialData)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

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
        } catch (error) {
            console.error('Form submission error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
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
                    {loading ? '⏳ Saving...' : `✅ ${submitLabel}`}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        ❌ Cancel
                    </button>
                )}
            </div>
        </form>
    )
}

export default Form
