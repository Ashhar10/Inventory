import { useState, useEffect } from 'react'

function TableView({
    columns,
    data,
    onEdit,
    onDelete,
    title,
    onAdd,
    loading = false,
    showUserAttribution = true
}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [expandedRow, setExpandedRow] = useState(null)
    const itemsPerPage = 10

    // Generate unique color for each user based on their name
    const getUserColor = (userName) => {
        if (!userName) return { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' }
        let hash = 0
        for (let i = 0; i < userName.length; i++) {
            hash = userName.charCodeAt(i) + ((hash << 5) - hash)
        }
        const hue = Math.abs(hash) % 360
        return {
            color: `hsl(${hue}, 70%, 55%)`,
            bg: `hsla(${hue}, 70%, 55%, 0.15)`,
            border: `hsla(${hue}, 70%, 55%, 0.5)`
        }
    }

    // Extract user info from row data
    const getUserInfo = (row) => {
        // Check for user object (from joined data) or user_name field
        const createdByUser = row.created_by_user?.full_name || row.creator?.full_name || null
        const updatedByUser = row.updated_by_user?.full_name || row.updater?.full_name || null

        // If we have activity log info embedded
        const lastModifiedBy = row.last_modified_by || updatedByUser || createdByUser

        return {
            createdBy: createdByUser,
            updatedBy: updatedByUser,
            lastModifiedBy: lastModifiedBy,
            hasAttribution: !!lastModifiedBy
        }
    }

    // Auto-collapse logic
    useEffect(() => {
        if (expandedRow !== null) {
            const timer = setTimeout(() => setExpandedRow(null), 5000)

            const handleOutsideClick = () => setExpandedRow(null)
            window.addEventListener('click', handleOutsideClick)

            return () => {
                clearTimeout(timer)
                window.removeEventListener('click', handleOutsideClick)
            }
        }
    }, [expandedRow])

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

    // Check if consecutive rows have same user for merging visual
    const shouldShowUserLabel = (currentIdx, userName) => {
        if (!userName) return false
        if (currentIdx === 0) return true

        const prevRow = paginatedData[currentIdx - 1]
        const prevUserInfo = getUserInfo(prevRow)
        return prevUserInfo.lastModifiedBy !== userName
    }

    // Check if next row has same user (for visual grouping)
    const hasNextSameUser = (currentIdx, userName) => {
        if (!userName) return false
        if (currentIdx >= paginatedData.length - 1) return false

        const nextRow = paginatedData[currentIdx + 1]
        const nextUserInfo = getUserInfo(nextRow)
        return nextUserInfo.lastModifiedBy === userName
    }

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
                <table className="table user-attribution-table">
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
                            paginatedData.map((row, idx) => {
                                const userInfo = getUserInfo(row)
                                const userColors = getUserColor(userInfo.lastModifiedBy)
                                const showLabel = showUserAttribution && shouldShowUserLabel(idx, userInfo.lastModifiedBy)
                                const nextSameUser = hasNextSameUser(idx, userInfo.lastModifiedBy)
                                const prevSameUser = idx > 0 && !shouldShowUserLabel(idx, userInfo.lastModifiedBy)

                                return (
                                    <tr
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setExpandedRow(expandedRow === idx ? null : idx)
                                        }}
                                        className={`${expandedRow === idx ? 'expanded' : ''} ${userInfo.hasAttribution && showUserAttribution ? 'has-attribution' : ''}`}
                                        style={userInfo.hasAttribution && showUserAttribution ? {
                                            '--user-color': userColors.color,
                                            '--user-bg': userColors.bg,
                                            '--user-border': userColors.border,
                                            borderLeft: `3px solid ${userColors.color}`,
                                            background: userColors.bg,
                                            borderTopLeftRadius: showLabel ? '8px' : '0',
                                            borderTopRightRadius: showLabel ? '8px' : '0',
                                            borderBottomLeftRadius: !nextSameUser ? '8px' : '0',
                                            borderBottomRightRadius: !nextSameUser ? '8px' : '0',
                                            marginTop: showLabel ? '0.5rem' : '0',
                                        } : {}}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td key={col.key} style={{ position: 'relative' }}>
                                                {col.render ? col.render(row[col.key], row) : row[col.key]}
                                            </td>
                                        ))}
                                        {(onEdit || onDelete) && (
                                            <td style={{ position: 'relative' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    {onEdit && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onEdit(row)
                                                            }}
                                                            className="btn-icon-action btn-edit"
                                                            title="Edit"
                                                        >
                                                            <img src="/assets/icons/Edit.png" alt="Edit" />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onDelete(row)
                                                            }}
                                                            className="btn-icon-action btn-delete"
                                                            title="Delete"
                                                        >
                                                            <img src="/assets/icons/Delete.png" alt="Delete" />
                                                        </button>
                                                    )}

                                                    {/* User Attribution Label */}
                                                    {showUserAttribution && userInfo.lastModifiedBy && showLabel && (
                                                        <div
                                                            className="user-attribution-label"
                                                            style={{
                                                                color: userColors.color,
                                                                borderColor: userColors.border,
                                                                background: userColors.bg,
                                                            }}
                                                            title={`Last modified by ${userInfo.lastModifiedBy}`}
                                                        >
                                                            {userInfo.lastModifiedBy}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            })
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
                        Previous
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
                        Next
                    </button>
                </div>
            )}

            <style>{`
                .user-attribution-table tbody tr.has-attribution {
                    position: relative;
                    transition: all 0.2s ease;
                }

                .user-attribution-table tbody tr.has-attribution:hover {
                    filter: brightness(1.1);
                }

                .user-attribution-label {
                    position: absolute;
                    right: 8px;
                    bottom: 4px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                    border: 1px solid;
                    white-space: nowrap;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    pointer-events: none;
                    z-index: 5;
                }

                /* Position the label properly within the actions cell */
                .user-attribution-table td:last-child {
                    position: relative;
                }

                .user-attribution-table td:last-child > div {
                    position: relative;
                }

                .user-attribution-table .user-attribution-label {
                    position: relative;
                    right: auto;
                    bottom: auto;
                    margin-left: auto;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .user-attribution-label {
                        font-size: 0.55rem;
                        padding: 1px 4px;
                    }
                }

                /* Icon Action Buttons */
                .btn-icon-action {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    padding: 0;
                }

                .btn-icon-action img {
                    width: 20px;
                    height: 20px;
                    object-fit: contain;
                }

                .btn-edit {
                    background: rgba(99, 102, 241, 0.15);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                }

                .btn-edit:hover {
                    background: rgba(99, 102, 241, 0.3);
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                .btn-delete {
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }

                .btn-delete:hover {
                    background: rgba(239, 68, 68, 0.3);
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                @media (max-width: 768px) {
                    .btn-icon-action {
                        width: 32px;
                        height: 32px;
                    }

                    .btn-icon-action img {
                        width: 16px;
                        height: 16px;
                    }
                }
            `}</style>
        </div>
    )
}

export default TableView
