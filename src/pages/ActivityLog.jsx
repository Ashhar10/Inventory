import { useState, useEffect } from 'react'
import { db } from '../supabase/client'

function ActivityLog() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedLog, setExpandedLog] = useState(null)
    const [filters, setFilters] = useState({
        action_type: '',
        entity_type: '',
    })

    const actionColors = {
        CREATE: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', light: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.5)', icon: '/assets/icons/Create.png' },
        UPDATE: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', light: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.5)', icon: '/assets/icons/Edit.png' },
        DELETE: { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', light: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.5)', icon: '/assets/icons/Delete.png' },
    }

    const entityIcons = {
        Customer: '/assets/icons/Customers.png',
        Product: '/assets/icons/Products.png',
        Inventory: '/assets/icons/Inventory.png',
        Order: '/assets/icons/Orders.png',
        Sale: '/assets/icons/Sales.png',
        Packing: '/assets/icons/Packing.png',
        Store: '/assets/icons/Stores.png',
        User: '/assets/icons/Users.png',
    }

    useEffect(() => {
        loadLogs()
    }, [filters])

    const loadLogs = async () => {
        setLoading(true)
        const { data, error } = await db.getActivityLogs(200, filters)
        if (!error && data) {
            setLogs(data)
        }
        setLoading(false)
    }

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
    }

    const formatDateTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-PK', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Generate unique color for each user based on their name
    const getUserColor = (userName) => {
        if (!userName) return { color: 'hsl(220, 70%, 50%)', bg: 'hsla(220, 70%, 50%, 0.15)' }
        let hash = 0
        for (let i = 0; i < userName.length; i++) {
            hash = userName.charCodeAt(i) + ((hash << 5) - hash)
        }
        const hue = Math.abs(hash) % 360
        return {
            color: `hsl(${hue}, 70%, 50%)`,
            bg: `hsla(${hue}, 70%, 50%, 0.15)`
        }
    }

    // Render detail items from log.details object
    const renderDetails = (details) => {
        if (!details || Object.keys(details).length === 0) return null

        const detailItems = []

        if (details.customer_code) detailItems.push({ label: 'Code', value: details.customer_code })
        if (details.company) detailItems.push({ label: 'Company', value: details.company })
        if (details.sku) detailItems.push({ label: 'SKU', value: details.sku })
        if (details.category) detailItems.push({ label: 'Category', value: details.category })
        if (details.location) detailItems.push({ label: 'Location', value: details.location })
        if (details.role) detailItems.push({ label: 'Role', value: details.role })
        if (details.status) detailItems.push({ label: 'Status', value: details.status })
        if (details.payment_method) detailItems.push({ label: 'Payment', value: details.payment_method })
        if (details.total_amount) detailItems.push({ label: 'Amount', value: `Rs. ${parseFloat(details.total_amount).toLocaleString()}` })
        if (details.quantity) detailItems.push({ label: 'Qty', value: details.quantity })
        if (details.new_quantity) detailItems.push({ label: 'New Qty', value: details.new_quantity })
        if (details.items_count) detailItems.push({ label: 'Items', value: details.items_count })
        if (details.updated_fields) detailItems.push({ label: 'Fields Changed', value: details.updated_fields.join(', ') })

        return detailItems
    }

    return (
        <div className="activity-log-page">
            <div className="activity-log-header">
                <h1>
                    <img src="/assets/icons/Activity.png" alt="Activity" className="header-icon" />
                    Activity Log
                </h1>
                <p className="header-subtitle">Complete audit trail of all system actions</p>
            </div>

            {/* Filters */}
            <div className="activity-filters">
                <div className="filter-group">
                    <label>Action</label>
                    <select
                        value={filters.action_type}
                        onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
                    >
                        <option value="">All</option>
                        <option value="CREATE">Created</option>
                        <option value="UPDATE">Updated</option>
                        <option value="DELETE">Deleted</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Entity</label>
                    <select
                        value={filters.entity_type}
                        onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
                    >
                        <option value="">All</option>
                        <option value="Customer">Customer</option>
                        <option value="Product">Product</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Order">Order</option>
                        <option value="Sale">Sale</option>
                        <option value="Packing">Packing</option>
                        <option value="Store">Store</option>
                        <option value="User">User</option>
                    </select>
                </div>
                <button className="btn-refresh" onClick={loadLogs}>
                    <img src="/assets/icons/Reset.png" alt="Refresh" className="btn-icon" />
                </button>
            </div>

            {/* Activity List */}
            <div className="activity-list">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <img src="/assets/icons/Clipboard.png" alt="No Activity" className="empty-icon" />
                        <h3>No Activity</h3>
                        <p>Logs will appear when actions are performed</p>
                    </div>
                ) : (
                    logs.map((log, index) => {
                        const colors = actionColors[log.action_type]
                        const userColors = getUserColor(log.user_name)
                        const details = renderDetails(log.details)
                        const isExpanded = expandedLog === log.id

                        return (
                            <div
                                key={log.id}
                                className={`activity-row ${isExpanded ? 'expanded' : ''}`}
                                style={{
                                    animationDelay: `${index * 0.03}s`,
                                    '--action-bg': colors?.light,
                                    '--action-border': colors?.border,
                                }}
                                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                            >
                                {/* Main Row */}
                                <div className="row-main">
                                    {/* Action Badge */}
                                    <div className="action-badge" style={{ background: colors?.bg }}>
                                        <img src={colors?.icon} alt={log.action_type} className="action-icon" />
                                    </div>

                                    {/* Content */}
                                    <div className="row-content">
                                        <div className="row-primary">
                                            <span
                                                className="user-tag"
                                                style={{
                                                    color: userColors.color,
                                                    background: userColors.bg,
                                                    borderColor: userColors.color
                                                }}
                                            >
                                                {log.user_name}
                                            </span>
                                            <span className="action-verb">
                                                {log.action_type === 'CREATE' && 'created'}
                                                {log.action_type === 'UPDATE' && 'updated'}
                                                {log.action_type === 'DELETE' && 'deleted'}
                                            </span>
                                            <span className="entity-tag">
                                                <img
                                                    src={entityIcons[log.entity_type] || '/assets/icons/Dashboard.png'}
                                                    alt=""
                                                    className="entity-icon"
                                                />
                                                {log.entity_type}
                                            </span>
                                        </div>
                                        <div className="row-secondary">
                                            <span className="entity-name">{log.entity_name}</span>
                                        </div>
                                    </div>

                                    {/* Time */}
                                    <div className="row-time">
                                        <span className="time-ago">{formatTimeAgo(log.created_at)}</span>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="row-expanded">
                                        <div className="detail-grid">
                                            <div className="detail-section">
                                                <div className="detail-label">Full Timestamp</div>
                                                <div className="detail-value">{formatDateTime(log.created_at)}</div>
                                            </div>
                                            <div className="detail-section">
                                                <div className="detail-label">User</div>
                                                <div className="detail-value">{log.user_name}</div>
                                            </div>
                                            <div className="detail-section">
                                                <div className="detail-label">Action</div>
                                                <div className="detail-value">{log.action_type}</div>
                                            </div>
                                            <div className="detail-section">
                                                <div className="detail-label">Entity Type</div>
                                                <div className="detail-value">{log.entity_type}</div>
                                            </div>
                                            <div className="detail-section">
                                                <div className="detail-label">Entity Name</div>
                                                <div className="detail-value">{log.entity_name || 'N/A'}</div>
                                            </div>
                                            <div className="detail-section">
                                                <div className="detail-label">Entity ID</div>
                                                <div className="detail-value id-value">{log.entity_id || 'N/A'}</div>
                                            </div>
                                            {details && details.map((item, i) => (
                                                <div key={i} className="detail-section">
                                                    <div className="detail-label">{item.label}</div>
                                                    <div className="detail-value">{item.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            <style>{`
                .activity-log-page {
                    padding: 0;
                    max-width: 100%;
                }

                .activity-log-header {
                    margin-bottom: 1.5rem;
                }

                .activity-log-header h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 0.25rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .header-icon {
                    width: 28px;
                    height: 28px;
                    object-fit: contain;
                }

                .header-subtitle {
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    margin: 0;
                }

                .activity-filters {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    align-items: flex-end;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    flex: 1;
                    max-width: 150px;
                }

                .filter-group label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .filter-group select {
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    border: 1px solid var(--glass-border);
                    background: var(--glass-bg);
                    color: var(--text-primary);
                    font-size: 0.85rem;
                    cursor: pointer;
                }

                .btn-refresh {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    border: 1px solid var(--glass-border);
                    background: var(--glass-bg);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .btn-refresh:hover {
                    background: var(--primary);
                    border-color: var(--primary);
                }

                .btn-refresh:hover .btn-icon {
                    filter: brightness(0) invert(1);
                }

                .btn-icon {
                    width: 18px;
                    height: 18px;
                    object-fit: contain;
                }

                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .loading-state,
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 1rem;
                    text-align: center;
                    background: var(--glass-bg);
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                }

                .empty-icon {
                    width: 48px;
                    height: 48px;
                    object-fit: contain;
                    margin-bottom: 0.75rem;
                    opacity: 0.6;
                }

                .empty-state h3 {
                    margin: 0 0 0.25rem 0;
                    color: var(--text-primary);
                    font-size: 1rem;
                }

                .empty-state p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }

                .activity-row {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    animation: fadeIn 0.3s ease forwards;
                    opacity: 0;
                    overflow: hidden;
                }

                .activity-row:hover {
                    border-color: var(--action-border);
                    background: var(--action-bg);
                }

                .activity-row.expanded {
                    border-color: var(--action-border);
                }

                @keyframes fadeIn {
                    to { opacity: 1; }
                }

                .row-main {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                }

                .action-badge {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .action-icon {
                    width: 18px;
                    height: 18px;
                    object-fit: contain;
                    filter: brightness(0) invert(1);
                }

                .row-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }

                .row-primary {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    flex-wrap: wrap;
                    font-size: 0.85rem;
                }

                .user-tag {
                    font-weight: 700;
                    padding: 0.15rem 0.4rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    border: 1px solid;
                }

                .action-verb {
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                }

                .entity-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.15rem 0.4rem;
                    background: var(--bg-secondary);
                    border-radius: 4px;
                    font-weight: 600;
                    font-size: 0.75rem;
                    color: var(--text-primary);
                }

                .entity-icon {
                    width: 14px;
                    height: 14px;
                    object-fit: contain;
                }

                .row-secondary {
                    font-size: 0.8rem;
                }

                .entity-name {
                    color: var(--primary);
                    font-weight: 600;
                }

                .row-time {
                    flex-shrink: 0;
                    text-align: right;
                }

                .time-ago {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .row-expanded {
                    padding: 0.75rem;
                    padding-top: 0;
                    border-top: 1px solid var(--glass-border);
                    margin-top: 0;
                    background: var(--action-bg);
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 0.75rem;
                    padding-top: 0.75rem;
                }

                .detail-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }

                .detail-label {
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .detail-value {
                    font-size: 0.8rem;
                    color: var(--text-primary);
                    font-weight: 500;
                    word-break: break-word;
                }

                .detail-value.id-value {
                    font-size: 0.65rem;
                    font-family: monospace;
                    color: var(--text-secondary);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .activity-log-header h1 {
                        font-size: 1.25rem;
                    }

                    .header-icon {
                        width: 24px;
                        height: 24px;
                    }

                    .activity-filters {
                        flex-wrap: wrap;
                    }

                    .filter-group {
                        max-width: none;
                        flex: 1 1 calc(50% - 0.5rem);
                    }

                    .btn-refresh {
                        width: 100%;
                        flex: 1 1 100%;
                        justify-content: center;
                    }

                    .action-badge {
                        width: 32px;
                        height: 32px;
                    }

                    .action-icon {
                        width: 16px;
                        height: 16px;
                    }

                    .row-main {
                        padding: 0.6rem;
                        gap: 0.5rem;
                    }

                    .row-primary {
                        font-size: 0.8rem;
                    }

                    .user-tag {
                        font-size: 0.7rem;
                    }

                    .entity-tag {
                        font-size: 0.7rem;
                    }

                    .detail-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 480px) {
                    .activity-log-header h1 {
                        font-size: 1.1rem;
                    }

                    .activity-filters {
                        gap: 0.5rem;
                    }

                    .filter-group {
                        flex: 1 1 100%;
                    }

                    .filter-group select {
                        padding: 0.4rem 0.5rem;
                        font-size: 0.8rem;
                    }

                    .row-main {
                        flex-wrap: wrap;
                    }

                    .row-content {
                        flex: 1 1 calc(100% - 50px);
                    }

                    .row-time {
                        flex: 1 1 100%;
                        text-align: left;
                        margin-top: 0.25rem;
                        padding-left: 44px;
                    }

                    .detail-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 0.5rem;
                    }

                    .detail-label {
                        font-size: 0.6rem;
                    }

                    .detail-value {
                        font-size: 0.75rem;
                    }
                }
            `}</style>
        </div>
    )
}

export default ActivityLog
