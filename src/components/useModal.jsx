import { useState, useCallback, useRef } from 'react'
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

    const isClosingRef = useRef(false)

    const showAlert = useCallback((message, title = '', type = 'info') => {
        // Prevent duplicate modals
        if (isClosingRef.current) return

        setModalState({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: null,
            showCancel: false,
        })
    }, [])

    const showConfirm = useCallback((message, onConfirm, title = 'Confirm') => {
        // Prevent duplicate modals
        if (isClosingRef.current) return

        setModalState({
            isOpen: true,
            title,
            message,
            type: 'confirm',
            onConfirm,
            showCancel: true,
        })
    }, [])

    const showSuccess = useCallback((message, title = 'Success') => {
        showAlert(message, title, 'success')
    }, [showAlert])

    const showError = useCallback((message, title = 'Error') => {
        showAlert(message, title, 'error')
    }, [showAlert])

    const showWarning = useCallback((message, title = 'Warning') => {
        showAlert(message, title, 'warning')
    }, [showAlert])

    const closeModal = useCallback(() => {
        // Prevent duplicate close calls
        if (isClosingRef.current) return

        isClosingRef.current = true
        setModalState((prev) => ({ ...prev, isOpen: false }))

        // Reset the closing flag after a short delay
        setTimeout(() => {
            isClosingRef.current = false
        }, 300)
    }, [])

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
