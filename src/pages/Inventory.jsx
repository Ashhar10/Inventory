import { useState, useEffect } from 'react'
import { db } from '../supabase/client'
import TableView from '../components/TableView'
import Form from '../components/Form'
import { useModal } from '../components/useModal.jsx'

function Inventory() {
    const [inventory, setInventory] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingInventory, setEditingInventory] = useState(null)
    const { showSuccess, showError, ModalComponent } = useModal()

    // For dropdowns
    const [stores, setStores] = useState([])
    const [products, setProducts] = useState([])

    const columns = [
        {
            key: 'product',
            label: 'Product Name',
            render: (val) => val?.name || 'N/A'
        },
        {
            key: 'product',
            label: 'SKU / Item Code',
            render: (val) => val?.sku || 'N/A'
        },
        {
            key: 'product',
            label: 'Category',
            render: (val) => val?.category || 'N/A'
        },
        {
            key: 'store',
            label: 'Store/Warehouse',
            render: (val) => val?.name || 'Main Store'
        },
        {
            key: 'quantity',
            label: 'Total Stock',
            render: (val, row) => {
                const qty = val || 0
                return (
                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                        {qty.toLocaleString()} {row.product?.unit_of_measure || ''}
                    </span>
                )
            }
        },
        {
            key: 'reserved_quantity',
            label: 'Reserved',
            render: (val) => <span style={{ color: '#f59e0b' }}>{val || 0}</span>
        },
        {
            key: 'available_quantity',
            label: 'Available',
            render: (val, row) => {
                const available = val || 0
                const reorderLevel = row.product?.reorder_level || 0
                const isLow = available <= reorderLevel
                return (
                    <span style={{
                        color: isLow ? '#ef4444' : '#10b981',
                        fontWeight: '700',
                        fontSize: '1.1rem'
                    }}>
                        {isLow && '⚠️ '}{available.toLocaleString()} {row.product?.unit_of_measure || ''}
                    </span>
                )
            }
        },
        {
            key: 'product',
            label: 'Unit Price',
            render: (val) => `Rs. ${parseFloat(val?.unit_price || 0).toLocaleString()}`
        },
        {
            key: 'location_bin',
            label: 'Location',
            render: (val) => val || '-'
        },
        {
            key: 'updated_at',
            label: 'Last Updated',
            render: (val) => val ? new Date(val).toLocaleDateString() : '-'
        },
    ]

    const formFields = [
        {
            name: 'product_id',
            label: 'Product',
            type: 'select',
            required: true,
            options: products.map(p => ({ value: p.id, label: `${p.sku} - ${p.name}` }))
        },
        {
            name: 'store_id',
            label: 'Store/Warehouse',
            type: 'select',
            required: true,
            options: stores.map(s => ({ value: s.id, label: s.name }))
        },
        { name: 'quantity', label: 'Total Quantity', type: 'number', required: true, placeholder: '0' },
        { name: 'reserved_quantity', label: 'Reserved Quantity', type: 'number', placeholder: '0' },
        { name: 'location_bin', label: 'Bin/Location', type: 'text', placeholder: 'A1-B2' },
        { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional inventory notes...' },
    ]

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)

        // Load all products first (primary data source)
        const { data: productsData } = await db.getProducts()
        if (productsData) {
            setProducts(productsData)
        }

        // Load inventory records
        const { data: inventoryData, error } = await db.getInventory()

        // Load stores for dropdown
        const { data: storesData } = await db.getStores()
        if (storesData) {
            setStores(storesData)
        }

        if (!error && inventoryData && productsData) {
            // Create a map of existing inventory by product_id
            const inventoryMap = new Map()
            inventoryData.forEach(inv => {
                if (inv.product_id) {
                    inventoryMap.set(inv.product_id, inv)
                }
            })

            // Merge products with their inventory data
            const mergedInventory = productsData.map(product => {
                const existingInv = inventoryMap.get(product.id)

                if (existingInv) {
                    // Product has inventory record
                    return existingInv
                } else {
                    // Product doesn't have inventory - create virtual record
                    return {
                        id: `virtual-${product.id}`,
                        product_id: product.id,
                        product: product,
                        store_id: null,
                        store: null,
                        quantity: 0,
                        reserved_quantity: 0,
                        available_quantity: 0,
                        location_bin: null,
                        updated_at: product.created_at
                    }
                }
            })

            setInventory(mergedInventory)
        } else if (productsData) {
            // No inventory records, just show products with zero stock
            const virtualInventory = productsData.map(product => ({
                id: `virtual-${product.id}`,
                product_id: product.id,
                product: product,
                store_id: null,
                store: null,
                quantity: 0,
                reserved_quantity: 0,
                available_quantity: 0,
                location_bin: null,
                updated_at: product.created_at
            }))
            setInventory(virtualInventory)
        }

        setLoading(false)
    }

    const handleAdd = () => {
        setEditingInventory(null)
        setShowModal(true)
    }

    const handleEdit = (item) => {
        setEditingInventory(item)
        setShowModal(true)
    }

    const handleSubmit = async (formData) => {
        try {
            const inventoryData = {
                product_id: formData.product_id,
                store_id: formData.store_id,
                quantity: formData.quantity ? parseInt(formData.quantity) : 0,
                reserved_quantity: formData.reserved_quantity ? parseInt(formData.reserved_quantity) : 0,
                location_bin: formData.location_bin,
            }

            let error
            if (editingInventory && !editingInventory.id.startsWith('virtual-')) {
                // Update existing inventory
                const result = await db.updateInventory(editingInventory.id, inventoryData)
                error = result.error
            } else {
                // Create new inventory record
                const result = await db.createInventory(inventoryData)
                error = result.error
            }

            if (!error) {
                setShowModal(false)
                loadData()
                showSuccess(
                    editingInventory ? 'Inventory updated successfully!' : 'Inventory record created successfully!'
                )
            } else {
                if (error.message.includes('duplicate') || error.message.includes('unique')) {
                    showError('An inventory record already exists for this product and store combination')
                } else {
                    showError('Error saving inventory: ' + error.message)
                }
            }
        } catch (err) {
            showError('An unexpected error occurred: ' + err.message)
        }
    }

    const lowStockItems = inventory.filter(item =>
        (item.available_quantity || 0) <= (item.product?.reorder_level || 0) &&
        (item.product?.reorder_level || 0) > 0
    )

    const totalValue = inventory.reduce((sum, item) => {
        const qty = item.quantity || 0
        const price = item.product?.unit_price || 0
        return sum + (qty * price)
    }, 0)

    return (
        <>
            <ModalComponent />

            <TableView
                title="Inventory Management - All Products"
                columns={columns}
                data={inventory}
                onAdd={handleAdd}
                onEdit={handleEdit}
                loading={loading}
            />

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
                            {editingInventory ? 'Update Inventory' : 'Add Inventory Record'}
                        </h2>
                        <Form
                            formId={editingInventory ? `inventory-edit-${editingInventory.id}` : 'inventory-create'}
                            fields={formFields}
                            initialData={editingInventory || { quantity: 0, reserved_quantity: 0 }}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowModal(false)}
                            submitLabel={editingInventory ? 'Update Inventory' : 'Add Inventory'}
                        />
                    </div>
                </div>
            )}

            <div className="container" style={{ marginTop: 'var(--spacing-2xl)' }}>
                <div className="glass-card" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3 style={{ color: 'white', marginBottom: 'var(--spacing-lg)', fontSize: '1.25rem' }}>
                        📊 Inventory Insights
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: 'white', fontWeight: '800' }}>
                                {inventory.length}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Total Products</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: '#ef4444', fontWeight: '800' }}>
                                {lowStockItems.length}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Low Stock Alerts</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: '#10b981', fontWeight: '800' }}>
                                {inventory.reduce((sum, item) => sum + (item.available_quantity || 0), 0).toLocaleString()}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Total Units Available</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: '#3b82f6', fontWeight: '800' }}>
                                Rs. {totalValue.toLocaleString()}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Total Inventory Value</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Inventory
