import { useState, useEffect } from 'react'
import { db } from '../supabase/client'

function ActivityLog() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        action_type: '',
        entity_type: '',
    })

    const actionColors = {
        CREATE: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: '#ffffff', icon: '/assets/icons/Create.png' },
        UPDATE: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', text: '#ffffff', icon: '/assets/icons/Edit.png' },
        DELETE: { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', text: '#ffffff', icon: '/assets/icons/Delete.png' },
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
        if (diffMins < 60) return `${diffMins} min ago`
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
        return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const formatDateTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-PK', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Generate unique color for each user based on their name
    const getUserColor = (userName) => {
        let hash = 0
        for (let i = 0; i < userName.length; i++) {
            hash = userName.charCodeAt(i) + ((hash << 5) - hash)
        }
        const hue = hash % 360
        return `hsl(${hue}, 70%, 45%)`
    }

    return (
        <div className="activity-log-page">
            <div className="activity-log-header">
                <h1>
                    <img src="/assets/icons/Activity.png" alt="Activity" className="header-icon" />
                    Activity Log
                </h1>
                <p className="header-subtitle">Track all user actions across the system</p>
            </div>

            {/* Filters */}
            <div className="activity-filters">
                <div className="filter-group">
                    <label>Action Type</label>
                    <select
                        value={filters.action_type}
                        onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
                    >
                        <option value="">All Actions</option>
                        <option value="CREATE">Created</option>
                        <option value="UPDATE">Updated</option>
                        <option value="DELETE">Deleted</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Entity Type</label>
                    <select
                        value={filters.entity_type}
                        onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
                    >
                        <option value="">All Entities</option>
                        <option value="Customer">Customers</option>
                        <option value="Product">Products</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Order">Orders</option>
                        <option value="Sale">Sales</option>
                        <option value="Packing">Packing</option>
                        <option value="Store">Stores</option>
                        <option value="User">Users</option>
                    </select>
                </div>
                <button className="btn-refresh" onClick={loadLogs}>
                    <img src="/assets/icons/Reset.png" alt="Refresh" className="btn-icon" />
                    Refresh
                </button>
            </div>

            {/* Activity Timeline */}
            <div className="activity-timeline">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading activity logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <img src="/assets/icons/Clipboard.png" alt="No Activity" className="empty-icon" />
                        <h3>No Activity Yet</h3>
                        <p>Activity logs will appear here when users perform actions</p>
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div
                            key={log.id}
                            className="activity-item"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="activity-timeline-dot">
                                <div
                                    className="dot-inner"
                                    style={{ background: actionColors[log.action_type]?.bg }}
                                ></div>
                            </div>

                            <div className="activity-card">
                                <div className="activity-card-header">
                                    <div
                                        className="action-badge"
                                        style={{ background: actionColors[log.action_type]?.bg }}
                                    >
                                        <img
                                            src={actionColors[log.action_type]?.icon}
                                            alt={log.action_type}
                                            className="action-icon"
                                        />
                                        <span>{log.action_type}</span>
                                    </div>
                                    <div className="activity-time">
                                        <span className="time-ago">{formatTimeAgo(log.created_at)}</span>
                                        <span className="time-full">{formatDateTime(log.created_at)}</span>
                                    </div>
                                </div>

                                <div className="activity-content">
                                    <span
                                        className="user-name"
                                        style={{
                                            color: getUserColor(log.user_name),
                                            borderColor: getUserColor(log.user_name),
                                        }}
                                    >
                                        {log.user_name}
                                    </span>
                                    <span className="action-text">
                                        {log.action_type === 'CREATE' && 'created'}
                                        {log.action_type === 'UPDATE' && 'updated'}
                                        {log.action_type === 'DELETE' && 'deleted'}
                                    </span>
                                    <span className="entity-badge">
                                        <img
                                            src={entityIcons[log.entity_type] || '/assets/icons/Dashboard.png'}
                                            alt={log.entity_type}
                                            className="entity-icon"
                                        />
                                        {log.entity_type}
                                    </span>
                                    <span className="entity-name">"{log.entity_name}"</span>
                                </div>

                                {log.details && (
                                    <div className="activity-details">
                                        {log.details.updated_fields && (
                                            <span className="detail-item">
                                                <strong>Fields:</strong> {log.details.updated_fields.join(', ')}
                                            </span>
                                        )}
                                        {log.details.total_amount && (
                                            <span className="detail-item">
                                                <strong>Amount:</strong> Rs. {parseFloat(log.details.total_amount).toLocaleString()}
                                            </span>
                                        )}
                                        {log.details.quantity && (
                                            <span className="detail-item">
                                                <strong>Quantity:</strong> {log.details.quantity}
                                            </span>
                                        )}
                                        {log.details.role && (
                                            <span className="detail-item">
                                                <strong>Role:</strong> {log.details.role}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .activity-log-page {
                    padding: 0;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .activity-log-header {
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .activity-log-header h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 0.5rem 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                }

                .header-icon {
                    width: 40px;
                    height: 40px;
                    object-fit: contain;
                }

                .header-subtitle {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    margin: 0;
                }

                .activity-filters {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    align-items: flex-end;
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 16px;
                    padding: 1.25rem;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    flex: 1;
                    min-width: 150px;
                }

                .filter-group label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .filter-group select {
                    padding: 0.75rem 1rem;
                    border-radius: 10px;
                    border: 1px solid var(--glass-border);
                    background: var(--glass-bg);
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .filter-group select:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                }

                .btn-refresh {
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    border: none;
                    background: var(--primary);
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-refresh:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                }

                .btn-icon {
                    width: 18px;
                    height: 18px;
                    object-fit: contain;
                    filter: brightness(0) invert(1);
                }

                .activity-timeline {
                    position: relative;
                }

                .activity-timeline::before {
                    content: '';
                    position: absolute;
                    left: 20px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: linear-gradient(180deg, var(--primary) 0%, var(--glass-border) 100%);
                    border-radius: 2px;
                }

                .loading-state,
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                    text-align: center;
                    background: var(--glass-bg);
                    border-radius: 16px;
                    border: 1px solid var(--glass-border);
                    margin-left: 40px;
                }

                .empty-icon {
                    width: 80px;
                    height: 80px;
                    object-fit: contain;
                    margin-bottom: 1rem;
                    opacity: 0.7;
                }

                .empty-state h3 {
                    margin: 0 0 0.5rem 0;
                    color: var(--text-primary);
                }

                .empty-state p {
                    margin: 0;
                    color: var(--text-secondary);
                }

                .activity-item {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                    position: relative;
                    animation: slideIn 0.4s ease forwards;
                    opacity: 0;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .activity-timeline-dot {
                    position: relative;
                    z-index: 1;
                    width: 42px;
                    height: 42px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .dot-inner {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    box-shadow: 0 0 0 4px var(--bg-primary), 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .activity-card {
                    flex: 1;
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 16px;
                    padding: 1.25rem;
                    transition: all 0.3s ease;
                }

                .activity-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                    border-color: var(--primary);
                }

                .activity-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .action-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: white;
                }

                .action-icon {
                    width: 16px;
                    height: 16px;
                    object-fit: contain;
                    filter: brightness(0) invert(1);
                }

                .activity-time {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.15rem;
                }

                .time-ago {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .time-full {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .activity-content {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    font-size: 0.95rem;
                    line-height: 1.6;
                }

                .user-name {
                    font-weight: 700;
                    padding: 0.2rem 0.6rem;
                    border-radius: 6px;
                    border: 2px solid;
                    background: rgba(255, 255, 255, 0.1);
                }

                .action-text {
                    color: var(--text-secondary);
                }

                .entity-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.2rem 0.6rem;
                    background: var(--bg-secondary);
                    border-radius: 6px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .entity-icon {
                    width: 18px;
                    height: 18px;
                    object-fit: contain;
                }

                .entity-name {
                    font-weight: 600;
                    color: var(--primary);
                }

                .activity-details {
                    margin-top: 0.75rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid var(--glass-border);
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .detail-item {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    background: var(--bg-secondary);
                    padding: 0.3rem 0.6rem;
                    border-radius: 6px;
                }

                .detail-item strong {
                    color: var(--text-primary);
                }

                @media (max-width: 768px) {
                    .activity-log-header h1 {
                        font-size: 1.5rem;
                    }

                    .header-icon {
                        width: 32px;
                        height: 32px;
                    }

                    .activity-timeline::before {
                        left: 10px;
                    }

                    .activity-timeline-dot {
                        width: 22px;
                    }

                    .activity-item {
                        gap: 0.75rem;
                    }

                    .activity-card {
                        padding: 1rem;
                    }

                    .activity-card-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .activity-time {
                        align-items: flex-start;
                    }

                    .filter-group {
                        min-width: 100%;
                    }

                    .btn-refresh {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    )
}

export default ActivityLog
