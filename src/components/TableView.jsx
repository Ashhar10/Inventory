import { useState } from 'react'

function TableView({
    columns,
    data,
    onEdit,
    onDelete,
    title,
    onAdd,
    loading = false
}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Filter data based on search
    const filteredData = data?.filter((row) => {
        return columns.some((col) => {
            const value = row[col.key]?.toString().toLowerCase() || ''
            return value.includes(searchTerm.toLowerCase())
        })
    }) || []

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

    if (loading) {
        return (
            <div className="container">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="container">
            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="flex-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <h1 className="section-title" style={{ color: 'white', margin: 0 }}>
                        {title}
                    </h1>
                    {onAdd && (
                        <button onClick={onAdd} className="btn btn-primary">
                            Add New
                        </button>
                    )}
                </div>

                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ maxWidth: '400px' }}
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                            {(onEdit || onDelete) && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No data found
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, idx) => (
                                <tr key={idx}>
                                    {columns.map((col) => (
                                        <td key={col.key}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(row)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(row)}
                                                        className="btn btn-danger"
                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: 'var(--spacing-xl)' }}>
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-secondary"
                        style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                        ← Previous
                    </button>
                    <span style={{ color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="btn btn-secondary"
                        style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    )
}

export default TableView
