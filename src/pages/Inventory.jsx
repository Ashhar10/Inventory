import { useState, useEffect } from 'react'
import { db } from '../supabase/client'
import TableView from '../components/TableView'

function Inventory() {
    const [inventory, setInventory] = useState([])
    const [loading, setLoading] = useState(true)

    const columns = [
        {
            key: 'product',
            label: 'Product',
            render: (val) => val?.name || 'N/A'
        },
        {
            key: 'product',
            label: 'SKU',
            render: (val) => val?.sku || 'N/A'
        },
        {
            key: 'store',
            label: 'Store/Warehouse',
            render: (val) => val?.name || 'N/A'
        },
        {
            key: 'quantity',
            label: 'Total Quantity',
            render: (val, row) => `${val} ${row.product?.unit_of_measure || ''}`
        },
        {
            key: 'reserved_quantity',
            label: 'Reserved',
            render: (val) => val || 0
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
                        fontWeight: '700'
                    }}>
                        {isLow && '⚠️ '}{available} {row.product?.unit_of_measure || ''}
                    </span>
                )
            }
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

    useEffect(() => {
        loadInventory()
    }, [])

    const loadInventory = async () => {
        setLoading(true)
        const { data, error } = await db.getInventory()
        if (!error && data) {
            setInventory(data)
        }
        setLoading(false)
    }

    return (
        <>
            <TableView
                title="🏢 Inventory Management"
                columns={columns}
                data={inventory}
                loading={loading}
            />

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
                            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Total Items</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: '#ef4444', fontWeight: '800' }}>
                                {inventory.filter(item => (item.available_quantity || 0) <= (item.product?.reorder_level || 0)).length}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Low Stock Alerts</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: '#10b981', fontWeight: '800' }}>
                                {inventory.reduce((sum, item) => sum + (item.available_quantity || 0), 0).toLocaleString()}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Total Units Available</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Inventory
