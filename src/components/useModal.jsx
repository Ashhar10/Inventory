import { useState, useCallback, useRef } from 'react'
import Modal from './Modal'

// Custom hook for modal dialogs with duplicate prevention
export function useModal() {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        showCancel: false,
    })

    // Track if modal is currently being shown to prevent duplicates
    const isShowingRef = useRef(false)
    const timeoutRef = useRef(null)

    const showAlert = useCallback((message, title = '', type = 'info') => {
        // Prevent duplicate modals
        if (isShowingRef.current) {
            return
        }

        isShowingRef.current = true
        setModalState({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: null,
            showCancel: false,
        })

        // Auto-reset after showing
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            isShowingRef.current = false
        }, 500)
    }, [])

    const showConfirm = useCallback((message, onConfirm, title = 'Confirm') => {
        // Prevent duplicate modals
        if (isShowingRef.current) {
            return
        }

        isShowingRef.current = true
        setModalState({
            isOpen: true,
            title,
            message,
            type: 'confirm',
            onConfirm,
            showCancel: true,
        })

        // Auto-reset after showing
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            isShowingRef.current = false
        }, 500)
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
        setModalState((prev) => ({ ...prev, isOpen: false }))
        // Reset showing flag when modal closes
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            isShowingRef.current = false
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
