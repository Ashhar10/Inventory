import { useState } from 'react'
import Modal from './Modal'

// Custom hook for modal dialogs
export function useModal() {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        showCancel: false,
    })

    const showAlert = (message, title = '', type = 'info') => {
        setModalState({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: null,
            showCancel: false,
        })
    }

    const showConfirm = (message, onConfirm, title = 'Confirm') => {
        setModalState({
            isOpen: true,
            title,
            message,
            type: 'confirm',
            onConfirm,
            showCancel: true,
        })
    }

    const showSuccess = (message, title = 'Success') => {
        showAlert(message, title, 'success')
    }

    const showError = (message, title = 'Error') => {
        showAlert(message, title, 'error')
    }

    const showWarning = (message, title = 'Warning') => {
        showAlert(message, title, 'warning')
    }

    const closeModal = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }))
    }

    const ModalComponent = () => (
        <Modal
            {...modalState}
            onClose={closeModal}
        />
    )

    return {
        showAlert,
        showConfirm,
        showSuccess,
        showError,
        showWarning,
        ModalComponent,
    }
}

export default Modal
