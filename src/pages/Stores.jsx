import { useState, useEffect } from 'react'
import { db } from '../supabase/client'
import TableView from '../components/TableView'
import Form from '../components/Form'
import { useModal } from '../components/useModal.jsx'

function Stores() {
    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingStore, setEditingStore] = useState(null)
    const { showSuccess, showError, showConfirm, ModalComponent } = useModal()

    const columns = [
        { key: 'name', label: 'Store Name' },
        { key: 'location', label: 'Location' },
        { key: 'address', label: 'Address' },
        { key: 'manager_name', label: 'Manager' },
        { key: 'contact_phone', label: 'Contact Phone' },
        {
            key: 'capacity',
            label: 'Capacity',
            render: (val) => val ? `${parseFloat(val).toLocaleString()} units` : 'N/A'
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (val) => <span style={{ color: val ? '#10b981' : '#ef4444', fontWeight: '600' }}>{val ? 'Active' : 'Inactive'}</span>
        },
    ]

    const formFields = [
        { name: 'name', label: 'Store Name', type: 'text', required: true, placeholder: 'Main Warehouse' },
        { name: 'location', label: 'Location/City', type: 'text', required: true, placeholder: 'Karachi' },
        { name: 'address', label: 'Full Address', type: 'textarea', placeholder: 'Complete address with area details...' },
        { name: 'manager_name', label: 'Store Manager', type: 'text', placeholder: 'Manager Name' },
        { name: 'contact_phone', label: 'Contact Phone', type: 'tel', placeholder: '+92-300-1234567' },
        { name: 'capacity', label: 'Storage Capacity (units)', type: 'number', placeholder: '10000' },
    ]

    useEffect(() => {
        loadStores()
    }, [])

    const loadStores = async () => {
        setLoading(true)
        const { data, error } = await db.getStores()
        if (!error && data) {
            setStores(data)
        }
        setLoading(false)
    }

    const handleAdd = () => {
        setEditingStore(null)
        setShowModal(true)
    }

    const handleEdit = (store) => {
        setEditingStore(store)
        setShowModal(true)
    }

    const handleDelete = async (store) => {
        showConfirm(
            `Are you sure you want to delete "${store.name}"? This action cannot be undone.`,
            async () => {
                const { error } = await db.deleteStore(store.id)
                if (!error) {
                    loadStores()
                    showSuccess('Store deleted successfully!')
                } else {
                    showError('Error deleting store: ' + error.message)
                }
            },
            'Delete Store'
        )
    }

    const handleSubmit = async (formData) => {
        try {
            const storeData = {
                ...formData,
                capacity: formData.capacity ? parseFloat(formData.capacity) : null,
                is_active: true,
            }

            let error
            if (editingStore) {
                const result = await db.updateStore(editingStore.id, storeData)
                error = result.error
            } else {
                const result = await db.createStore(storeData)
                error = result.error
            }

            if (!error) {
                setShowModal(false)
                loadStores()
                showSuccess(
                    editingStore ? 'Store updated successfully!' : 'Store created successfully!'
                )
            } else {
                showError('Error saving store: ' + error.message)
            }
        } catch (err) {
            showError('An unexpected error occurred: ' + err.message)
        }
    }

    return (
        <>
            <ModalComponent />

            <TableView
                title="Stores Management"
                columns={columns}
                data={stores}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
            />

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
                            {editingStore ? 'Edit Store' : 'Add New Store'}
                        </h2>
                        <Form
                            formId={editingStore ? `store-edit-${editingStore.id}` : 'store-create'}
                            fields={formFields}
                            initialData={editingStore || {}}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowModal(false)}
                            submitLabel={editingStore ? 'Update Store' : 'Create Store'}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default Stores
