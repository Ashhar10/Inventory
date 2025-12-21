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

    // Pre-packaging system
    const [packingMode, setPackingMode] = useState('order') // 'order' or 'inventory'
    const [packagedInventory, setPackagedInventory] = useState([])

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

    const getFormFields = () => {
        if (packingMode === 'inventory') {
            return [
                {
                    name: 'product_id',
                    label: 'Product',
                    type: 'select',
                    required: true,
                    options: products.map(product => ({ value: product.id, label: `${product.name} (${product.sku})` }))
                },
                { name: 'quantity', label: 'Quantity', type: 'number', required: true, placeholder: '100' },
                { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Pre-packaging notes...' },
            ]
        }
        return formFields
    }

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)

        const { data: packingData, error } = await db.getPacking()
        if (!error && packingData) {
            setPacking(packingData)
        }

        const { data: packagedData } = await db.getPackagedInventory()
        if (packagedData) setPackagedInventory(packagedData)

        const { data: ordersData } = await db.getOrders()
        if (ordersData) setOrders(ordersData)

        const { data: storesData } = await db.getStores()
        if (storesData) setStores(storesData)

        const { data: productsData } = await db.getProducts()
        if (productsData) setProducts(productsData)

        setLoading(false)
    }

    const handleAdd = () => {
        setEditingPacking(null)
        setShowModal(true)
    }

    const handleEdit = (packingRecord) => {
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
            if (packingMode === 'inventory') {
                const inventoryData = {
                    product_id: formData.product_id,
                    quantity: parseInt(formData.quantity),
                    notes: formData.notes,
                }

                const { error } = await db.createPackagedInventory(inventoryData)

                if (!error) {
                    setShowModal(false)
                    loadData()
                    showSuccess('Product packaged successfully and added to inventory!')
                } else {
                    showError('Error packaging product: ' + error.message)
                }
                return
            }

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

            <div className="container" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="glass-card" style={{ padding: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem' }}>Packing Mode</h3>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {packingMode === 'order' ? 'Pack products for specific orders' : 'Pre-package products for inventory'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
                        <button
                            onClick={() => { setPackingMode('order'); setShowModal(false) }}
                            className="btn"
                            style={{
                                padding: '0.5rem 1rem',
                                background: packingMode === 'order' ? 'var(--bg-gradient-primary)' : 'transparent',
                                color: 'white',
                                border: 'none',
                                fontSize: '0.9rem'
                            }}
                        >
                            Order Packing
                        </button>
                        <button
                            onClick={() => { setPackingMode('inventory'); setShowModal(false) }}
                            className="btn"
                            style={{
                                padding: '0.5rem 1rem',
                                background: packingMode === 'inventory' ? 'var(--bg-gradient-primary)' : 'transparent',
                                color: 'white',
                                border: 'none',
                                fontSize: '0.9rem'
                            }}
                        >
                            Inventory Packing
                        </button>
                    </div>
                </div>
            </div>

            {packingMode === 'order' ? (
                <TableView
                    title="Packing Management"
                    columns={columns}
                    data={packing}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    loading={loading}
                />
            ) : (
                <TableView
                    title="Packaged Inventory"
                    columns={[
                        {
                            key: 'product',
                            label: 'Product',
                            render: (val) => val?.name || 'N/A'
                        },
                        { key: 'quantity', label: 'Quantity' },
                        {
                            key: 'packaging_date',
                            label: 'Packaged Date',
                            render: (val) => new Date(val).toLocaleDateString()
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (val) => {
                                const colors = {
                                    available: '#10b981',
                                    reserved: '#f59e0b',
                                    used: '#6b7280'
                                }
                                return <span style={{ color: colors[val] || '#6b7280', fontWeight: '600', textTransform: 'capitalize' }}>{val}</span>
                            }
                        },
                        { key: 'notes', label: 'Notes' },
                    ]}
                    data={packagedInventory}
                    onAdd={handleAdd}
                    onDelete={async (item) => {
                        showConfirm(
                            `Delete this packaged inventory (${item.product?.name})?`,
                            async () => {
                                const { error } = await db.deletePackagedInventory(item.id)
                                if (!error) {
                                    loadData()
                                    showSuccess('Packaged inventory deleted!')
                                } else {
                                    showError('Error: ' + error.message)
                                }
                            },
                            'Delete Packaged Inventory'
                        )
                    }}
                    loading={loading}
                />
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
                            {packingMode === 'inventory'
                                ? 'Package Product for Inventory'
                                : (editingPacking ? 'Edit Packing Record' : 'Create Packing Record')}
                        </h2>
                        <Form
                            formId={editingPacking ? `packing-edit-${editingPacking.id}` : `packing-create-${packingMode}`}
                            fields={getFormFields()}
                            initialData={packingMode === 'inventory'
                                ? { quantity: 1 }
                                : (editingPacking || { status: 'pending', total_packages: 1, packed_date: new Date().toISOString().split('T')[0] })
                            }
                            onSubmit={handleSubmit}
                            onCancel={() => setShowModal(false)}
                            submitLabel={packingMode === 'inventory'
                                ? 'Package Product'
                                : (editingPacking ? 'Update Packing' : 'Create Packing')}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default Packing
