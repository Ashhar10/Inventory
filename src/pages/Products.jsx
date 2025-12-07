import { useState, useEffect } from 'react'
import { db, auth } from '../supabase/client'
import TableView from '../components/TableView'
import Form from '../components/Form'
import { useModal } from '../components/useModal.jsx'

function Products() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const { showSuccess, showError, showConfirm, ModalComponent } = useModal()

    const columns = [
        { key: 'sku', label: 'SKU' },
        { key: 'name', label: 'Product Name' },
        { key: 'category', label: 'Category' },
        {
            key: 'unit_price',
            label: 'Unit Price',
            render: (val) => `Rs. ${parseFloat(val || 0).toFixed(2)}`
        },
        { key: 'unit_of_measure', label: 'Unit' },
        { key: 'reorder_level', label: 'Reorder Level' },
        {
            key: 'is_active',
            label: 'Status',
            render: (val) => val ? '✅ Active' : '⛔ Inactive'
        },
    ]

    const formFields = [
        { name: 'sku', label: 'SKU', type: 'text', required: true, placeholder: 'WIRE-001' },
        { name: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'Galvanized Wire 2.5mm' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Product description...' },
        {
            name: 'category',
            label: 'Category',
            type: 'select',
            required: true,
            options: [
                { value: 'Galvanized Wire', label: 'Galvanized Wire' },
                { value: 'Barbed Wire', label: 'Barbed Wire' },
                { value: 'Chain Link', label: 'Chain Link' },
                { value: 'Wire Rope', label: 'Wire Rope' },
                { value: 'Other', label: 'Other' },
            ]
        },
        {
            name: 'unit_of_measure',
            label: 'Unit of Measure',
            type: 'select',
            required: true,
            options: [
                { value: 'KG', label: 'KG' },
                { value: 'METER', label: 'METER' },
                { value: 'ROLL', label: 'ROLL' },
                { value: 'PCS', label: 'PCS' },
            ]
        },
        { name: 'unit_price', label: 'Unit Price (Rs.)', type: 'number', required: true, placeholder: '250.00' },
        { name: 'cost_price', label: 'Cost Price (Rs.)', type: 'number', placeholder: '180.00' },
        { name: 'reorder_level', label: 'Reorder Level', type: 'number', required: true, placeholder: '100' },
    ]

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        setLoading(true)
        const { data, error } = await db.getProducts()
        if (!error && data) {
            setProducts(data)
        }
        setLoading(false)
    }

    const handleAdd = () => {
        setEditingProduct(null)
        setShowModal(true)
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setShowModal(true)
    }

    const handleDelete = async (product) => {
        showConfirm(
            `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
            async () => {
                const { error } = await db.deleteProduct(product.id)
                if (!error) {
                    loadProducts()
                    showSuccess('Product deleted successfully!')
                } else {
                    showError('Error deleting product: ' + error.message)
                }
            },
            'Delete Product'
        )
    }

    const handleSubmit = async (formData) => {
        try {
            const user = await auth.getCurrentUser()
            const productData = {
                ...formData,
                unit_price: parseFloat(formData.unit_price),
                cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
                reorder_level: parseInt(formData.reorder_level),
                is_active: true,
            }

            // Only add created_by if user exists in database
            if (user?.id) {
                productData.created_by = user.id
            }

            let error
            if (editingProduct) {
                const result = await db.updateProduct(editingProduct.id, productData)
                error = result.error
            } else {
                const result = await db.createProduct(productData)
                error = result.error
            }

            if (!error) {
                setShowModal(false)
                loadProducts()
                showSuccess(
                    editingProduct ? 'Product updated successfully!' : 'Product created successfully!'
                )
            } else {
                showError('Error saving product: ' + error.message)
            }
        } catch (err) {
            showError('An unexpected error occurred: ' + err.message)
        }
    }

    return (
        <>
            <ModalComponent />

            <TableView
                title="📦 Products Management"
                columns={columns}
                data={products}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
            />

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
                            {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                        </h2>
                        <Form
                            fields={formFields}
                            initialData={editingProduct || {}}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowModal(false)}
                            submitLabel={editingProduct ? 'Update Product' : 'Create Product'}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default Products
