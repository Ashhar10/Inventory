import { useState, useEffect } from 'react'
import { db, auth } from '../supabase/client'
import TableView from '../components/TableView'
import Form from '../components/Form'
import { useModal } from '../components/useModal.jsx'

function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const { showSuccess, showError, showConfirm, ModalComponent } = useModal()

    const columns = [
        { key: 'full_name', label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role', render: (val) => <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{val}</span> },
        { key: 'phone', label: 'Phone' },
        {
            key: 'is_active',
            label: 'Status',
            render: (val) => <span style={{ color: val ? '#10b981' : '#ef4444', fontWeight: '600' }}>{val ? 'Active' : 'Inactive'}</span>
        },
        {
            key: 'created_at',
            label: 'Created',
            render: (val) => new Date(val).toLocaleDateString()
        },
    ]

    const formFields = [
        { name: 'full_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Muhammad Ali' },
        { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'user@example.com' },
        { name: 'password', label: editingUser ? 'New Password (leave blank to keep current)' : 'Password', type: 'password', required: !editingUser, placeholder: 'Minimum 8 characters' },
        { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+92-300-1234567' },
        {
            name: 'role',
            label: 'User Role',
            type: 'select',
            required: true,
            options: [
                { value: 'admin', label: 'Administrator' },
                { value: 'manager', label: 'Manager' },
                { value: 'staff', label: 'Staff' },
                { value: 'user', label: 'User' },
            ]
        },
    ]

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        const { data, error } = await db.getUsers()
        if (!error && data) {
            setUsers(data)
        }
        setLoading(false)
    }

    const handleAdd = () => {
        setEditingUser(null)
        setShowModal(true)
    }

    const handleEdit = (user) => {
        setEditingUser(user)
        setShowModal(true)
    }

    const handleDelete = async (user) => {
        const currentUser = await auth.getCurrentUser()

        if (currentUser?.id === user.id) {
            showError('You cannot delete your own account!')
            return
        }

        showConfirm(
            `Are you sure you want to delete user "${user.full_name}"? This action cannot be undone.`,
            async () => {
                const { error } = await db.deleteUser(user.id)
                if (!error) {
                    loadUsers()
                    showSuccess('User deleted successfully!')
                } else {
                    showError('Error deleting user: ' + error.message)
                }
            },
            'Delete User'
        )
    }

    const handleSubmit = async (formData) => {
        try {
            // Validate password length if provided
            if (formData.password && formData.password.length < 8) {
                showError('Password must be at least 8 characters long')
                return
            }

            const userData = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role || 'user',
                is_active: true,
            }

            // Only include password if it's provided
            if (formData.password) {
                userData.password = formData.password
            }

            let error
            if (editingUser) {
                const result = await db.updateUser(editingUser.id, userData)
                error = result.error
            } else {
                const result = await db.createUser(userData)
                error = result.error
            }

            if (!error) {
                setShowModal(false)
                loadUsers()
                showSuccess(
                    editingUser ? 'User updated successfully!' : 'User created successfully!'
                )
            } else {
                if (error.message.includes('duplicate') || error.message.includes('unique')) {
                    showError('A user with this email already exists')
                } else {
                    showError('Error saving user: ' + error.message)
                }
            }
        } catch (err) {
            showError('An unexpected error occurred: ' + err.message)
        }
    }

    return (
        <>
            <ModalComponent />

            <TableView
                title="User Management"
                columns={columns}
                data={users}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
            />

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </h2>
                        <Form
                            fields={formFields}
                            initialData={editingUser || { role: 'user' }}
                            onSubmit={handleSubmit}
                            onCancel={() => setShowModal(false)}
                            submitLabel={editingUser ? 'Update User' : 'Create User'}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default Users
