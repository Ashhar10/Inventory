import { useState, useEffect } from 'react'
import { db } from '../supabase/client'
import TableView from '../components/TableView'
import Form from '../components/Form'
import { useModal } from '../components/useModal.jsx'

function Packing() {
    const [packing, setPacking] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingPacking, setEditingPacking] = useState(null)
    const { showSuccess, showError, showConfirm, ModalComponent } = useModal()

    // For dropdowns
    const [orders, setOrders] = useState([])
    const [stores, setStores] = useState([])
    const [products, setProducts] = useState([])

    const columns = [
        { key: 'packing_slip_number', label: 'Packing Slip #' },
        {
            key: 'order',
            label: 'Order',
            render: (val) => val?.order_number || 'N/A'
        },
        {
            key: 'store',
            label: 'Store',
            render: (val) => val?.name || 'N/A'
        },
        {
            key: 'packed_date',
            label: 'Packed Date',
            render: (val) => new Date(val).toLocaleDateString()
        },
        { key: 'total_packages', label: 'Packages' },
        {
            key: 'total_weight',
            label: 'Weight (kg)',
            render: (val) => val ? parseFloat(val).toFixed(2) : 'N/A'
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => {
                const colors = {
                    pending: '#f59e0b',
                    packed: '#3b82f6',
                    shipped: '#8b5cf6',
                    delivered: '#10b981'
                }
                return <span style={{ color: colors[val] || '#6b7280', fontWeight: '600', textTransform: 'capitalize' }}>{val}</span>
            }
        },
    ]

    const formFields = [
        { name: 'packing_slip_number', label: 'Packing Slip Number', type: 'text', required: true, placeholder: 'AUTO' },
        {
            name: 'order_id',
            label: 'Order',
            type: 'select',
            required: true,
            options: orders.map(order => ({ value: order.id, label: `${order.order_number} - ${order.customer?.name || 'N/A'}` }))
        },
        {
            name: 'store_id',
            label: 'Store',
            type: 'select',
            required: true,
            options: stores.map(store => ({ value: store.id, label: store.name }))
        },
        { name: 'packed_date', label: 'Packed Date', type: 'date', required: true },
        { name: 'total_packages', label: 'Total Packages', type: 'number', placeholder: '1' },
        { name: 'total_weight', label: 'Total Weight (kg)', type: 'number', placeholder: '0.00' },
        { name: 'shipping_method', label: 'Shipping Method', type: 'text', placeholder: 'Road Transport' },
        { name: 'tracking_number', label: 'Tracking Number', type: 'text', placeholder: 'TRK123456' },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'packed', label: 'Packed' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
            ]
        },
        { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional packing notes...' },
    ]

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)

        // Load packing records
        const { data: packingData, error } = await db.getPacking()
        if (!error && packingData) {
            setPacking(packingData)
        }

        // Load orders for dropdown
        const { data: ordersData } = await db.getOrders()
        if (ordersData) setOrders(ordersData)

        // Load stores for dropdown
        const { data: storesData } = await db.getStores()
        if (storesData) setStores(storesData)

        // Load products for packing items
        const { data: productsData } = await db.getProducts()
        if (productsData) setProducts(productsData)

        setLoading(false)
    }

    const handleAdd = () => {
        setEditingPacking(null)
        setShowModal(true)
    }

    const handleEdit = (packingRecord) => {
        // Prepare editing data
        const editData = {
            ...packingRecord,
            packed_date: packingRecord.packed_date ? new Date(packingRecord.packed_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }
        setEditingPacking(editData)
        setShowModal(true)
    }

    const handleDelete = async (packingRecord) => {
        showConfirm(
            `Are you sure you want to delete packing slip "${packingRecord.packing_slip_number}"? This action cannot be undone.`,
            async () => {
                const { error } = await db.deletePacking(packingRecord.id)
                if (!error) {
                    loadData()
                    showSuccess('Packing record deleted successfully!')
                } else {
                    showError('Error deleting packing record: ' + error.message)
                }
            },
            'Delete Packing Record'
        )
    }

    const handleSubmit = async (formData) => {
        try {
            const packingData = {
                packing_slip_number: formData.packing_slip_number || `PACK-${Date.now().toString().slice(-6)}`,
                order_id: formData.order_id,
                store_id: formData.store_id,
                packed_date: formData.packed_date || new Date().toISOString(),
                total_packages: formData.total_packages ? parseInt(formData.total_packages) : 1,
                total_weight: formData.total_weight ? parseFloat(formData.total_weight) : null,
                shipping_method: formData.shipping_method,
                tracking_number: formData.tracking_number,
                status: formData.status || 'pending',
                notes: formData.notes,
            }

            let error
            if (editingPacking) {
                const result = await db.updatePacking(editingPacking.id, packingData)
                error = result.error
            } else {
                // For new packing, we need packing items - simplified for now
                const result = await db.createPacking(packingData, [])
                error = result.error
            }

            if (!error) {
                setShowModal(false)
                loadData()
                showSuccess(
                    editingPacking ? 'Packing record updated successfully!' : 'Packing record created successfully!'
                )
            } else {
                showError('Error saving packing record: ' + error.message)
            }
        } catch (err) {
            showError('An unexpected error occurred: ' + err.message)
        }
    }

    return (
        <>
            <ModalComponent />

            <TableView
                title="Packing Management"
                columns={columns}
                data={packing}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
            />

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
                            {editingPacking ? 'Edit Packing Record' : 'Create Packing Record'}
                        </h2>
                        <Form
                            fields={formFields}
                            initialData={editingPacking || { status: 'pending', total_packages: 1, packed_date: new Date().toISOString().split('T')[0] }}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowModal(false)}
                            submitLabel={editingPacking ? 'Update Packing' : 'Create Packing'}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default Packing
