import { useState, useEffect } from 'react'
import { db, auth } from '../supabase/client'
import TableView from '../components/TableView'
import Form from '../components/Form'

function Customers() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState(null)

    const columns = [
        { key: 'customer_code', label: 'Code' },
        { key: 'name', label: 'Customer Name' },
        { key: 'company_name', label: 'Company' },
        { key: 'phone', label: 'Phone' },
        { key: 'city', label: 'City' },
        {
            key: 'credit_limit',
            label: 'Credit Limit',
            render: (val) => `Rs. ${parseFloat(val || 0).toLocaleString()}`
        },
        {
            key: 'current_balance',
            label: 'Balance',
            render: (val) => {
                const balance = parseFloat(val || 0)
                return (
                    <span style={{ color: balance > 0 ? '#ef4444' : '#10b981', fontWeight: '700' }}>
                        Rs. {balance.toLocaleString()}
                    </span>
                )
            }
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (val) => val ? '✅ Active' : '⛔ Inactive'
        },
    ]

    const formFields = [
        { name: 'customer_code', label: 'Customer Code', type: 'text', required: true, placeholder: 'CUST-001' },
        { name: 'name', label: 'Customer Name', type: 'text', required: true, placeholder: 'Muhammad Ali' },
        { name: 'company_name', label: 'Company Name', type: 'text', placeholder: 'Ali Construction Ltd' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'customer@example.com' },
        { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+92-300-1234567' },
        { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Full address...' },
        { name: 'city', label: 'City', type: 'text', placeholder: 'Karachi' },
        { name: 'credit_limit', label: 'Credit Limit (Rs.)', type: 'number', placeholder: '500000' },
        {
            name: 'payment_terms',
            label: 'Payment Terms',
            type: 'select',
            options: [
                { value: 'Cash', label: 'Cash' },
                { value: 'Net 15', label: 'Net 15 Days' },
                { value: 'Net 30', label: 'Net 30 Days' },
                { value: 'Net 45', label: 'Net 45 Days' },
                { value: 'Net 60', label: 'Net 60 Days' },
            ]
        },
    ]

    useEffect(() => {
        loadCustomers()
    }, [])

    const loadCustomers = async () => {
        setLoading(true)
        const { data, error } = await db.getCustomers()
        if (!error && data) {
            setCustomers(data)
        }
        setLoading(false)
    }

    const handleAdd = () => {
        setEditingCustomer(null)
        setShowModal(true)
    }

    const handleEdit = (customer) => {
        setEditingCustomer(customer)
        setShowModal(true)
    }

    const handleDelete = async (customer) => {
        if (!window.confirm(`Are you sure you want to delete ${customer.name}?`)) return

        const { error } = await db.deleteCustomer(customer.id)
        if (!error) {
            loadCustomers()
            alert('Customer deleted successfully!')
        } else {
            alert('Error deleting customer: ' + error.message)
        }
    }

    const handleSubmit = async (formData) => {
        const user = await auth.getCurrentUser()
        const customerData = {
            ...formData,
            credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : 0,
            current_balance: 0,
            country: 'Pakistan',
            is_active: true,
            created_by: user?.id,
        }

        let error
        if (editingCustomer) {
            const result = await db.updateCustomer(editingCustomer.id, customerData)
            error = result.error
        } else {
            const result = await db.createCustomer(customerData)
            error = result.error
        }

        if (!error) {
            setShowModal(false)
            loadCustomers()
            alert(editingCustomer ? 'Customer updated successfully!' : 'Customer created successfully!')
        } else {
            alert('Error saving customer: ' + error.message)
        }
    }

    return (
        <>
            <TableView
                title="👥 Customers Management"
                columns={columns}
                data={customers}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
            />

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
                            {editingCustomer ? '✏️ Edit Customer' : '➕ Add New Customer'}
                        </h2>
                        <Form
                            fields={formFields}
                            initialData={editingCustomer || {}}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowModal(false)}
                            submitLabel={editingCustomer ? 'Update Customer' : 'Create Customer'}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default Customers
